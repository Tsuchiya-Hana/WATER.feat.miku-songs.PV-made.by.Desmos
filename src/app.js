/* WATER feat. miku — page controller. The visuals are Desmos expressions;
   this file only drives time, camera cuts, subtitles and the overlay UI. */
(function () {
  'use strict';

  const D = window.WATER_DATA;
  const SC = window.WATER_SCENES;
  const SHOTS = D.SHOTS;
  const CUES = D.CUES;
  const IMPACTS = D.IMPACTS;
  const SECTIONS = SC.sections;
  const DURATION = 299.294;
  const DESMOS_FPS = 30;

  const q = new URLSearchParams(location.search);
  const STATIC = q.has('t') || q.get('static') === '1';
  const CLEAN = q.get('clean') === '1';
  const NOLYRICS = q.get('nolyrics') === '1';
  const NOFX = q.get('nofx') === '1';
  const SHOW_EXPR = q.get('expr') === '1';

  const stage = document.getElementById('stage');
  const desmosEl = document.getElementById('desmos');
  const lyricsEl = document.getElementById('lyrics');
  const bootEl = document.getElementById('boot');
  const bootMsg = document.getElementById('boot-msg');
  const startEl = document.getElementById('startScreen');
  const startNote = document.getElementById('start-note');
  const titleEl = document.getElementById('titleCard');
  const endEl = document.getElementById('endCard');
  const sectionEl = document.getElementById('sectionCard');
  const secNum = document.getElementById('sec-num');
  const secJp = document.getElementById('sec-jp');
  const secEn = document.getElementById('sec-en');
  const atmosphereEl = document.getElementById('atmosphere');
  const sceneWipeEl = document.getElementById('sceneWipe');
  const flashEl = document.getElementById('flash');
  const edgeEl = document.getElementById('edgeflash');
  const progressFill = document.getElementById('progress-fill');
  const audio = document.getElementById('audio');
  const seek = document.getElementById('seek');
  const clock = document.getElementById('clock');
  const playIcon = document.getElementById('play-icon');
  const playBtn = document.getElementById('btn-play');

  if (CLEAN) stage.classList.add('clean');
  if (NOLYRICS) stage.classList.add('nolyrics');
  if (NOFX) stage.classList.add('nofx');
  if (STATIC) stage.classList.add('static');

  let calc = null;
  let ready = false;
  let started = false;
  let playing = false;
  let silent = false;
  const INITIAL_T = STATIC ? Math.max(0, parseFloat(q.get('t') || '0')) : 0;
  let T = INITIAL_T;
  let lastDesmosT = -1;
  let sceneIndex = 0;
  let shotIndex = -1;
  let cueIndex = -1;
  let cueParts = [];
  let cueEl = null;
  let cueZhEl = null;
  let cueClass = '';
  let sectionShownAt = -99;
  let clockT0 = 0;
  let clockWall = 0;
  let frameCount = 0;
  let lastFrame = 0;
  let lastHudUpdate = 0;
  let lastFlashT = -99;
  let idleTimer = 0;
  let audioBroken = false;
  let desmosFailed = false;
  let dragSeek = false;

  const safety = { hz: 1.5, chroma: 0.18, bright: 0.15, strong: false };
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------ utils
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutExpo = x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
  const easeOutCubic = x => 1 - Math.pow(1 - x, 3);

  const ATMO = {
    A: { x: '50%', y: '18%', c: '#F0B36A', a: 0.40 },
    B: { x: '50%', y: '50%', c: '#2AA7B8', a: 0.28 },
    C: { x: '68%', y: '42%', c: '#44E0D0', a: 0.30 },
    D: { x: '50%', y: '50%', c: '#1E7A8C', a: 0.24 },
    E: { x: '18%', y: '30%', c: '#BFE3EA', a: 0.22 },
    F: { x: '50%', y: '50%', c: '#2AA7B8', a: 0.26 },
    G: { x: '62%', y: '50%', c: '#FF5A6E', a: 0.14 },
    H: { x: '50%', y: '50%', c: '#2AA7B8', a: 0.27 },
    I: { x: '62%', y: '35%', c: '#FFD9A0', a: 0.38 },
    J: { x: '50%', y: '42%', c: '#9EDCE8', a: 0.24 },
    K: { x: '66%', y: '45%', c: '#FFCF9A', a: 0.30 },
    L: { x: '50%', y: '48%', c: '#FFCF9A', a: 0.30 },
    M: { x: '70%', y: '42%', c: '#FFCF9A', a: 0.30 }
  };
  function hexA(hex, a) {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  const DEPTH_KEYS = [[0, 0], [12, 3], [25, 12], [49.042, 48], [59.042, 88], [69.333, 145], [92.292, 410], [116.25, 760], [118.417, 820], [141.667, 1480], [163, 2350], [187.708, 3300], [211.917, 4500], [246.917, 6200], [289.958, 9700], [299.294, 10000]];
  function smooth01(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function depthAt(t) {
    for (let i = 0; i < DEPTH_KEYS.length - 1; i++) {
      const a = DEPTH_KEYS[i], b = DEPTH_KEYS[i + 1];
      if (t >= a[0] && t <= b[0]) {
        const p = smooth01((t - a[0]) / Math.max(0.001, b[0] - a[0]));
        return a[1] + (b[1] - a[1]) * p;
      }
    }
    return t < 0 ? 0 : DEPTH_KEYS[DEPTH_KEYS.length - 1][1];
  }

  function pulseAt(t) {
    let sum = 0;
    const inv = 1 / 0.075;
    for (let i = 0; i < IMPACTS.length; i++) {
      sum += Math.pow(0.74, Math.abs(t - IMPACTS[i]) * inv);
      if (sum > 2.4) return 2.4;
    }
    return sum;
  }

  function setText(el, v) { if (el && el.textContent !== v) el.textContent = v; }

  function fmtTime(t) {
    t = Math.max(0, t);
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    const ms = Math.floor((t - Math.floor(t)) * 1000);
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + '.' + String(ms).padStart(3, '0');
  }

  function currentTime() {
    if (STATIC) return T;
    if (audio && !audio.paused && audio.readyState >= 2 && !audioBroken) return audio.currentTime;
    if (playing) return clockT0 + (performance.now() - clockWall) / 1000;
    return T;
  }

  function hideTrial() {
    document.querySelectorAll('.dcg-api-trial-notice-container, .dcg-api-trial-notice').forEach(function (el) {
      el.style.display = 'none';
    });
  }

  // ------------------------------------------------------------------ desmos
  window.__desmosError = function (e) {
    desmosFailed = true;
    ready = true;
    if (bootMsg) bootMsg.textContent = 'DESMOS API 加载失败 · 请检查网络后刷新';
    if (startNote) startNote.textContent = 'Desmos API 加载失败：仍可播放音频与字幕，请检查网络后刷新。';
    if (stage) stage.classList.add('no-desmos');
    console.error('Desmos API failed', e);
    if (bootEl) setTimeout(function () { bootEl.classList.add('hide'); }, 900);
  };

  window.__bootMV = function () {
    try {
      calc = Desmos.GraphingCalculator(desmosEl, {
        language: 'zh-CN',
        expressions: SHOW_EXPR,
        expressionsCollapsed: !SHOW_EXPR,
        settingsMenu: false,
        zoomButtons: false,
        keypad: false,
        graphpaper: true,
        border: false,
        lockViewport: true,
        invertedColors: false,
        showGrid: false,
        showXAxis: false,
        showYAxis: false,
        xAxisNumbers: false,
        yAxisNumbers: false,
        pointsOfInterest: false,
        trace: false,
        actions: false,
        sliders: false,
        folders: false,
        notes: false,
        images: false,
        autosize: true
      });
      calc.setMathBounds({ left: -10, right: 10, bottom: -5.625, top: 5.625 });
      calc.updateSettings({ showGrid: false, showXAxis: false, showYAxis: false, xAxisNumbers: false, yAxisNumbers: false });
      calc.setExpressions(SC.all);
      window.calc = calc;
      window.__hideID = function (id) { calc.setExpression({ id: id, hidden: true }); };
      window.__showID = function (id) { calc.setExpression({ id: id, hidden: false }); };
      window.__showScene = function () {
        SC.scenes[sceneIndex].ids.forEach(function (id) { calc.setExpression({ id: id, hidden: false }); });
      };
      (q.get('hide') || '').split(',').filter(Boolean).forEach(function (id) { window.__hideID(id); });
      hideTrial();
      setTimeout(hideTrial, 600);
      setTimeout(hideTrial, 1800);

      // make the first scene visible, then compute initial state
      applyScene(0, true);
      applyShot(T, true);
      forceTime(T);

      setTimeout(function () {
        ready = true;
        window.__exprErrors = collectErrors();
        if (Object.keys(window.__exprErrors).length) {
          console.warn('Desmos expression errors', window.__exprErrors);
        }
        hideBoot();
        if (STATIC) {
          seekTo(T, true);
          requestAnimationFrame(function () { requestAnimationFrame(function () { requestAnimationFrame(function () {
            window.__frameReady = true;
          }); }); });
        }
      }, 1400);
    } catch (err) {
      console.error(err);
      window.__desmosError(err);
    }
  };

  function collectErrors() {
    const out = {};
    if (!calc || !calc.expressionAnalysis) return out;
    for (const id in calc.expressionAnalysis) {
      const a = calc.expressionAnalysis[id];
      if (a && a.isError) out[id] = a.errorMessage || true;
    }
    return out;
  }
  window.__analysis = collectErrors;

  function hideBoot() {
    if (bootEl) bootEl.classList.add('hide');
  }

  function applyScene(n, force) {
    if (!calc) return;
    n = clamp(n, 0, SC.scenes.length - 1);
    if (!force && n === sceneIndex) return;
    const prev = SC.scenes[sceneIndex];
    const next = SC.scenes[n];
    const batch = [];
    if (force) {
      SC.scenes.forEach(function (s, i) {
        s.ids.forEach(function (id) { batch.push({ id: id, hidden: i !== n }); });
      });
    } else {
      prev.ids.forEach(function (id) { batch.push({ id: id, hidden: true }); });
      next.ids.forEach(function (id) { batch.push({ id: id, hidden: false }); });
    }
    calc.setExpressions(batch);
    calc.setExpression({ id: 'S', latex: 'S=' + (n + 1) });
    sceneIndex = n;
    sectionShownAt = T;
    const sec = SECTIONS[n];
    setText(secNum, sec.id);
    setText(secJp, sec.name);
    setText(secEn, sec.en);
    setText(document.getElementById('hud-section'), sec.id + ' / ' + sec.name);
    const at = ATMO[sec.id] || ATMO.A;
    if (atmosphereEl) {
      atmosphereEl.style.background = 'radial-gradient(ellipse at ' + at.x + ' ' + at.y + ', ' +
        hexA(at.c, at.a) + ' 0%, ' + hexA(at.c, at.a * 0.34) + ' 34%, transparent 66%)';
      atmosphereEl.style.opacity = '0.9';
    }
    if (sceneWipeEl && sceneWipeEl.animate) {
      sceneWipeEl.animate(
        [{ opacity: 0.88 }, { opacity: 0 }],
        { duration: 420, easing: 'cubic-bezier(.2,.7,.2,1)' }
      );
    }
  }

  function applyShot(t, force) {
    const idx = shotAt(t);
    if (!force && idx === shotIndex) return;
    shotIndex = idx;
    if (calc) {
      const sh = SHOTS[idx];
      calc.setExpressions([
        { id: 'K', latex: 'K=' + (idx + 1) },
        { id: 'ts', latex: 't_s=' + sh.s.toFixed(3) }
      ]);
    }
    setText(document.getElementById('hud-shot'), 'SHOT ' + String(idx + 1).padStart(3, '0') + ' / ' + SHOTS.length);
  }

  function shotAt(t) {
    let lo = 0, hi = SHOTS.length - 1;
    if (t <= SHOTS[0].s) return 0;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (SHOTS[mid].s <= t) lo = mid; else hi = mid - 1;
    }
    return lo;
  }

  function sceneAt(t) {
    for (let i = SECTIONS.length - 1; i >= 0; i--) {
      if (t >= SECTIONS[i].s) return i;
    }
    return 0;
  }

  function forceTime(t) {
    if (!calc) return;
    calc.setExpression({ id: 'T', latex: 'T=' + t.toFixed(3) });
    lastDesmosT = t;
  }

  // ------------------------------------------------------------------ playback
  function startPlayback() {
    if (started) { togglePlay(); return; }
    started = true;
    stage.classList.add('started');
    startEl.style.display = 'none';
    clockT0 = T;
    clockWall = performance.now();
    silent = audioBroken || !audio || audio.readyState < 2;
    if (!silent && audio) {
      audio.currentTime = clamp(T, 0, DURATION);
      const p = audio.play();
      if (p && p.catch) p.catch(function () {
        silent = true; playing = true; clockT0 = T; clockWall = performance.now(); updatePlayIcon();
      });
    }
    playing = true;
    updatePlayIcon();
    showControls(true);
  }

  function togglePlay() {
    if (!started) { startPlayback(); return; }
    if (playing) {
      T = currentTime();
      if (!silent && audio) audio.pause();
      playing = false;
    } else {
      clockT0 = T;
      clockWall = performance.now();
      silent = audioBroken || !audio || audio.readyState < 2;
      if (!silent && audio) {
        if (audio.currentTime !== T) audio.currentTime = clamp(T, 0, DURATION);
        const p = audio.play();
        if (p && p.catch) p.catch(function () {
          silent = true; playing = true; clockT0 = T; clockWall = performance.now(); updatePlayIcon();
        });
      }
      playing = true;
    }
    updatePlayIcon();
    showControls(true);
  }

  function updatePlayIcon() {
    if (!playIcon) return;
    playIcon.setAttribute('d', playing ? 'M7 5h4v14H7zm6 0h4v14h-4z' : 'M8 5v14l11-7z');
  }

  function seekTo(t, force) {
    t = clamp(t, 0, DURATION);
    T = t;
    if (audio && !audioBroken && isFinite(audio.duration) && audio.duration > 0) {
      try { audio.currentTime = t; } catch (e) { /* ignore */ }
    }
    clockT0 = t;
    clockWall = performance.now();
    lastDesmosT = -1;
    lastFlashT = -99;
    if (ready) {
      const si = sceneAt(t);
      if (si !== sceneIndex || force) applyScene(si, force || si !== sceneIndex);
      applyShot(t, true);
      forceTime(t);
      renderCue(true);
      updateHud(t, true);
    }
  }

  function showControls(show) {
    const c = document.getElementById('controls');
    if (!c) return;
    if (show) c.classList.add('show');
    clearTimeout(idleTimer);
    if (show) {
      idleTimer = setTimeout(function () {
        if (!dragSeek && playing) c.classList.remove('show');
      }, 2800);
    }
  }

  // ------------------------------------------------------------------ lyrics
  const ACCENT = new Set('ABCDEFG1234TEXT甲乙丙丁输入文本'.split(''));
  const TELEMETRY = /^TELEMETRY/;

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function buildCueHTML(cue) {
    const ja = cue.ja;
    let cls = 'lyr-line';
    let html = '';
    const parts = [];

    if (TELEMETRY.test(ja)) {
      cls += ' telemetry';
      const words = ja.replace(/[（(][^）)]*[）)]/g, '').split(/[\s　]+/).filter(Boolean);
      words.forEach(function (w, i) {
        html += '<span class="ch word" data-i="' + i + '">' + esc(w) + '</span>';
        parts.push({ kind: 'word', i: i });
      });
    } else if (/　/.test(ja) && (ja.split('　').length >= 3)) {
      cls += ' spread';
      const words = ja.split('　');
      words.forEach(function (w, i) {
        html += '<span class="ch word" data-i="' + i + '">' + esc(w) + '</span>';
        parts.push({ kind: 'word', i: i });
      });
    } else {
      if (/BREATH/.test(ja)) cls += ' breath';
      if ((cue.s >= 59.042 && cue.s < 69.333) || (cue.s >= 118.417 && cue.s < 141.667) || (cue.s >= 211.917 && cue.s < 246.917)) cls += ' chorus';
      if (cue.s > 289) cls += ' final';
      let idx = 0;
      for (let i = 0; i < ja.length;) {
        const ch = ja[i];
        if (ch === '（' || ch === '(') {
          let j = i + 1;
          while (j < ja.length && ja[j] !== '）' && ja[j] !== ')') j++;
          const f = ja.slice(i, Math.min(j + 1, ja.length));
          html += '<span class="furi ch" data-i="' + idx + '">' + esc(f) + '</span>';
          parts.push({ kind: 'char', i: idx });
          idx++;
          i = j + 1;
        } else if (ch === ' ' || ch === '　') {
          html += '<span class="ch" data-i="' + idx + '">&nbsp;</span>';
          parts.push({ kind: 'char', i: idx });
          idx++;
          i++;
        } else {
          const accent = ACCENT.has(ch);
          html += '<span class="ch' + (accent ? ' accent' : '') + '" data-i="' + idx + '">' + esc(ch) + '</span>';
          parts.push({ kind: 'char', i: idx });
          idx++;
          i++;
        }
      }
    }
    return { cls: cls, html: html, parts: parts };
  }

  function setCue(idx) {
    if (idx === cueIndex) return;
    cueIndex = idx;
    if (idx < 0) {
      lyricsEl.innerHTML = '';
      cueEl = null; cueZhEl = null; cueParts = [];
      return;
    }
    const cue = CUES[idx];
    const built = buildCueHTML(cue);
    cueClass = built.cls;
    lyricsEl.innerHTML = '<div class="' + built.cls + '">' + built.html + '</div>' +
      (cue.zh ? '<div class="lyr-zh">' + esc(cue.zh) + '</div>' : '') +
      '<div class="lyr-meta">TEXT ' + String(idx + 1).padStart(2, '0') + ' / ' + String(CUES.length).padStart(2, '0') + '</div>';
    lyricsEl.style.bottom = /telemetry/.test(built.cls) ? '16.5%' : (/spread/.test(built.cls) ? '13.8%' : '10.2%');
    cueEl = lyricsEl.querySelector('.lyr-line');
    cueZhEl = lyricsEl.querySelector('.lyr-zh');
    cueParts = Array.prototype.slice.call(lyricsEl.querySelectorAll('.ch'));
    for (let i = 0; i < cueParts.length; i++) {
      cueParts[i].__i = i;
      cueParts[i].__kind = cueParts[i].classList.contains('word') ? 'word' : 'char';
    }
  }

  function renderCue(force) {
    const idx = cueAt(T);
    if (idx !== cueIndex || force) setCue(idx);
    if (cueIndex < 0) return;
    const cue = CUES[cueIndex];
    const lt = T - cue.s;
    const exitStart = cue.e - 0.26;
    const qout = clamp((T - exitStart) / 0.26, 0, 1);
    const breath = /BREATH/.test(cue.ja);
    if (cueEl) {
      cueEl.style.opacity = 1;
      cueEl.style.transform = 'scale(' + (1 + 0.012 * Math.min(1.6, pulseAt(T))).toFixed(4) + ')';
      if (breath) {
        const s = 1 + 0.05 * Math.sin((T - cue.s) * 2.4);
        cueEl.style.letterSpacing = (0.05 + 0.035 * s) + 'em';
      }
    }
    for (let k = 0; k < cueParts.length; k++) {
      const el = cueParts[k];
      const i = el.__i || 0;
      const kind = el.__kind;
      const stag = kind === 'word' ? 0.055 : 0.018;
      const dur = kind === 'word' ? 0.45 : 0.36;
      let e = clamp((lt - i * stag) / dur, 0, 1);
      const eo = easeOutExpo(e);
      const y = (1 - eo) * (kind === 'word' ? 30 : 24) - qout * 18 + Math.sin(T * 1.35 + i * 0.42) * 1.1;
      const x = (1 - eo) * (i % 2 ? 7 : -7) * (kind === 'word' ? 1.8 : 1);
      const sc = 0.94 + eo * 0.06 - qout * 0.015;
      const blur = (1 - eo) * 7 + qout * 6;
      const rot = (1 - eo) * (i % 2 ? 2.1 : -2.1);
      el.style.opacity = String(clamp(eo * (1 - qout), 0, 1));
      el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) rotate(' + rot.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
      el.style.filter = blur > 0.05 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';
    }
    if (cueZhEl) {
      const e = clamp(lt / 0.5, 0, 1);
      const eo = easeOutCubic(e);
      cueZhEl.style.opacity = String((0.78 * eo) * (1 - qout));
      cueZhEl.style.transform = 'translateY(' + ((1 - eo) * 8 - qout * 6).toFixed(2) + 'px)';
    }
  }

  function cueAt(t) {
    for (let i = CUES.length - 1; i >= 0; i--) {
      if (t >= CUES[i].s && t < CUES[i].e) return i;
    }
    return -1;
  }

  // ------------------------------------------------------------------ hud / fx
  function updateHud(t, force) {
    const now = performance.now();
    const p = pulseAt(t);
    if (!force && now - lastHudUpdate < 80) return;
    lastHudUpdate = now;
    const depth = depthAt(t) + p * 8;
    const pressure = 1 + depth / 10;
    const o2 = clamp(21 - 9.2 * (t / 295.75), 9.8, 21);
    setText(document.getElementById('hud-depth'), String(Math.round(depth)).padStart(4, '0') + 'm');
    setText(document.getElementById('hud-pressure'), pressure.toFixed(2) + 'atm');
    setText(document.getElementById('hud-o2'), o2.toFixed(1) + '%');
    setText(document.getElementById('hud-time'), fmtTime(t));
    setText(document.getElementById('hud-pulse'), p.toFixed(2));
    const sec = SECTIONS[sceneAt(t)];
    setText(document.getElementById('hud-section'), sec.id + ' / ' + sec.name);
    const marker = document.getElementById('depth-marker');
    if (marker) marker.style.top = clamp(depth / 10200 * 100, 0, 100) + '%';
    const o2el = document.getElementById('hud-o2');
    if (o2el) o2el.style.color = o2 < 14 ? 'rgba(255,90,110,.85)' : '';
    setText(clock, fmtTime(t) + ' / ' + fmtTime(DURATION));
    if (!dragSeek) seek.value = String(t.toFixed(2));
  }

  function updateFx(t) {
    const p = pulseAt(t);
    let gate = 0;
    if (p > 0.55 && safety.hz > 0) {
      const interval = 1 / safety.hz;
      if (t - lastFlashT >= interval) lastFlashT = t;
      if (t - lastFlashT <= Math.min(0.16, interval * 0.55)) gate = 1;
    }
    const amp = safety.bright * (safety.strong ? 1.7 : 1);
    const flash = gate * Math.min(safety.strong ? 0.15 : 0.055, p * 0.04 * (0.35 + amp));
    flashEl.style.opacity = String(flash);
    edgeEl.style.opacity = String(gate * Math.min(0.2, p * 0.05 * (0.2 + safety.chroma)));

    stage.style.setProperty('--pulse', p.toFixed(3));

    // title card
    let titleOp = 0;
    if (t < 3.9 && started) {
      titleOp = clamp(t / 1.0, 0, 1) * clamp((3.9 - t) / 1.1, 0, 1);
    } else if (!started && !STATIC) {
      titleOp = 0;
    }
    titleEl.style.opacity = String(titleOp);
    if (titleOp > 0) {
      titleEl.style.transform = 'scale(' + (1 + 0.012 * Math.sin(t * 0.8)) + ')';
    }

    // section card
    const since = t - sectionShownAt;
    const secOp = clamp(since / 0.3, 0, 1) * clamp((2.7 - since) / 0.55, 0, 1);
    sectionEl.style.opacity = String(secOp);
    sectionEl.style.transform = 'translateX(' + ((1 - clamp(since / 0.5, 0, 1)) * -18).toFixed(2) + 'px)';

    // end card
    let endOp = 0;
    if (t > 296.0) endOp = clamp((t - 296.0) / 1.4, 0, 1);
    endEl.style.opacity = String(endOp);
    endEl.style.pointerEvents = endOp > 0.2 ? 'auto' : 'none';

    progressFill.style.width = clamp(t / DURATION * 100, 0, 100) + '%';
  }

  // ------------------------------------------------------------------ loop
  function frame(now) {
    requestAnimationFrame(frame);
    frameCount++;
    if (!ready) return;
    const t = currentTime();
    T = t;

    const si = sceneAt(t);
    if (si !== sceneIndex) applyScene(si, false);
    applyShot(t, false);

    const minGap = 1 / DESMOS_FPS;
    if (Math.abs(t - lastDesmosT) >= minGap || t === 0) {
      forceTime(t);
    }
    renderCue(false);
    updateHud(t, false);
    updateFx(t);
    if (STATIC && frameCount > 3) window.__frameReady = true;
  }

  // ------------------------------------------------------------------ init UI
  function initHudRuler() {
    const ruler = document.getElementById('depth-ruler');
    if (!ruler) return;
    for (let i = 0; i <= 20; i++) {
      const tick = document.createElement('i');
      tick.style.top = (i * 5) + '%';
      if (i % 5 === 0) tick.className = 'major';
      ruler.appendChild(tick);
    }
    const prog = document.getElementById('progress');
    CUES.forEach(function (c) {
      const tick = document.createElement('div');
      tick.className = 'tick';
      tick.style.left = (c.s / DURATION * 100) + '%';
      prog.appendChild(tick);
    });
  }

  function initControls() {
    playBtn.addEventListener('click', function (e) { e.stopPropagation(); togglePlay(); });
    document.getElementById('btn-back').addEventListener('click', function () { seekTo(currentTime() - 10, true); });
    document.getElementById('btn-fwd').addEventListener('click', function () { seekTo(currentTime() + 10, true); });
    seek.addEventListener('input', function () {
      dragSeek = true;
      const v = parseFloat(seek.value);
      T = v;
      if (audio && !audioBroken && isFinite(audio.duration)) audio.currentTime = v;
      clockT0 = v; clockWall = performance.now();
    });
    seek.addEventListener('change', function () {
      dragSeek = false;
      seekTo(parseFloat(seek.value), true);
    });
    document.getElementById('btn-sound').addEventListener('click', function () {
      if (!audio) return;
      audio.muted = !audio.muted;
      this.style.opacity = audio.muted ? '.4' : '1';
    });
    document.getElementById('btn-file').addEventListener('click', function () {
      document.getElementById('audioFile').click();
    });
    document.getElementById('audioFile').addEventListener('change', function (e) {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      audioBroken = false;
      silent = false;
      audio.src = URL.createObjectURL(f);
      audio.load();
      audio.play().catch(function () { silent = true; });
    });
    document.getElementById('btn-full').addEventListener('click', function () {
      if (!document.fullscreenElement) {
        (stage.requestFullscreen || stage.webkitRequestFullscreen || function () {}).call(stage);
      } else {
        document.exitFullscreen();
      }
    });
    document.getElementById('btn-safety').addEventListener('click', function (e) {
      e.stopPropagation();
      document.getElementById('safety').classList.toggle('open');
    });
    document.getElementById('safety-close').addEventListener('click', function () {
      document.getElementById('safety').classList.remove('open');
    });

    document.getElementById('safe-hz').addEventListener('input', function () {
      safety.hz = clamp(parseFloat(this.value) || 0, 0, 3);
    });
    document.getElementById('safe-chroma').addEventListener('input', function () {
      safety.chroma = clamp(parseFloat(this.value) || 0, 0, 1);
      stage.style.setProperty('--chroma', safety.chroma.toFixed(2));
    });
    document.getElementById('safe-bright').addEventListener('input', function () {
      safety.bright = clamp(parseFloat(this.value) || 0, 0, 1);
    });
    document.getElementById('safe-strong').addEventListener('change', function () {
      safety.strong = this.checked;
    });

    document.getElementById('replay').addEventListener('click', function (e) {
      e.stopPropagation();
      endEl.style.opacity = '0';
      seekTo(0, true);
      if (audio && !audioBroken) { audio.currentTime = 0; audio.play().catch(function () {}); }
      playing = true;
      silent = audioBroken;
      clockT0 = 0; clockWall = performance.now();
      updatePlayIcon();
    });

    stage.addEventListener('click', function (e) {
      if (!started && !STATIC) { startPlayback(); return; }
      if (e.target.closest('button') || e.target.closest('input') || e.target.closest('#safety')) return;
      togglePlay();
    });
    stage.addEventListener('mousemove', function () {
      showControls(true);
      document.body.classList.remove('idle');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        if (playing && !dragSeek) { showControls(false); document.body.classList.add('idle'); }
      }, 2600);
    });

    window.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); if (!started) startPlayback(); else togglePlay(); }
      if (e.code === 'ArrowRight') { e.preventDefault(); seekTo(currentTime() + 5, true); }
      if (e.code === 'ArrowLeft') { e.preventDefault(); seekTo(currentTime() - 5, true); }
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) (stage.requestFullscreen || function () {}).call(stage);
        else document.exitFullscreen();
      }
    });

    startEl.addEventListener('click', function (e) { e.stopPropagation(); startPlayback(); });
    startEl.addEventListener('keydown', function (e) { if (e.code === 'Enter' || e.code === 'Space') startPlayback(); });

    audio.addEventListener('loadedmetadata', function () {
      startNote.textContent = '音频已就绪 · 画面由 Desmos 图表实时演算';
      if (started && playing && silent && !audioBroken) {
        try { audio.currentTime = clamp(T, 0, DURATION); } catch (e) { /* ignore */ }
        const p = audio.play();
        if (p && p.then) p.then(function () { silent = false; }).catch(function () {});
      }
    });
    audio.addEventListener('error', function () {
      audioBroken = true;
      silent = true;
      startNote.textContent = '未选择音频：可点击 ♪ 选择本地音频，画面仍会播放。';
    });
    audio.addEventListener('ended', function () {
      playing = false;
      updatePlayIcon();
      if (T >= DURATION - 0.5) T = DURATION;
    });
    audio.addEventListener('play', function () { silent = false; playing = true; updatePlayIcon(); });
    // pause state is controlled by togglePlay(); the element's own pause event
    // can fire when a play() promise is rejected in headless/blocked contexts.
    audio.addEventListener('seeking', function () {
      if (!STATIC && started && playing && !dragSeek) { T = audio.currentTime; lastDesmosT = -1; }
    });
  }

  function initStart() {
    if (STATIC) {
      startEl.style.display = 'none';
      started = true;
      stage.classList.add('started');
      bootEl.classList.add('hide');
    }
    initHudRuler();
    initControls();
    updatePlayIcon();
    renderCue(false);
    updateHud(T, true);
    updateFx(T);
    requestAnimationFrame(frame);
  }

  window.__seek = function (t) { seekTo(t, true); };
  window.__stats = function () {
    return JSON.stringify({
      expressions: SC.all.length, scenes: SC.scenes.length, shots: SHOTS.length,
      cues: CUES.length, impacts: IMPACTS.length, duration: DURATION
    });
  };
  window.__mvState = function () {
    return JSON.stringify({
      search: location.search, initT: INITIAL_T, T: T, started: started, playing: playing, static: STATIC,
      scene: sceneIndex, shot: shotIndex, cue: cueIndex, ready: ready,
      audio: audio ? audio.currentTime : null, dur: audio ? audio.duration : null,
      frame: frameCount, title: document.title
    });
  };

  // The Desmos API is loaded after this script; __bootMV is called by its onload.
  initStart();

  // Allow an early click before Desmos is ready: audio can start, visuals follow.
  window.__frameReady = false;
})();


