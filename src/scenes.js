/* WATER feat. miku — Desmos scene score.
   All geometry is drawn by Desmos expressions; the page only supplies T, K, t_s and UI.
   Coordinate system: x [-10,10], y [-5.625,5.625]. Camera: screen = c_z*(world - c).
*/
window.WATER_SCENES = (function () {
  'use strict';
  const R = String.raw;
  const D = window.WATER_DATA;
  const SHOTS = D.SHOTS;
  const IMPACTS = D.IMPACTS;

  // ---------------------------------------------------------------- sections
  const SECTIONS = [
    { id:'A', s:0.000,  e:49.042, name:'SCENE A',   en:'PART A',  color:'#6FE3E1', bg:'#030D16', cam:{x:0,y:1.35,z:1.00,dx:0.00,dy:-1.50,dz:0.03} },
    { id:'B', s:49.042, e:59.042, name:'SCENE B',     en:'PART B',    color:'#44E0D0', bg:'#04121C', cam:{x:0,y:0.35,z:1.00,dx:0.00,dy:-0.55,dz:0.02} },
    { id:'C', s:59.042, e:69.333, name:'SCENE C',     en:'PART C',    color:'#62D8D2', bg:'#031018', cam:{x:0,y:0.10,z:1.02,dx:0.30,dy:-0.10,dz:0.02} },
    { id:'D', s:69.333, e:92.292, name:'SCENE D',     en:'PART D',   color:'#2AA7B8', bg:'#020A12', cam:{x:0,y:0.00,z:0.98,dx:0.00,dy:-0.50,dz:-0.02} },
    { id:'E', s:92.292, e:116.250,name:'SCENE E',     en:'PART E',   color:'#1E7A8C', bg:'#01060B', cam:{x:0,y:-0.50,z:1.00,dx:0.00,dy:-0.40,dz:0.02} },
    { id:'F', s:116.250,e:118.417,name:'SCENE F',     en:'PART F',     color:'#2AA7B8', bg:'#01060B', cam:{x:0,y:0.00,z:1.00,dx:0.00,dy:0.00,dz:0.00} },
    { id:'G', s:118.417,e:141.667,name:'SCENE G',     en:'PART G',       color:'#2AA7B8', bg:'#05070C', cam:{x:0,y:0.00,z:1.04,dx:0.00,dy:-0.20,dz:0.02} },
    { id:'H', s:141.667,e:163.000,name:'SCENE H',       en:'PART H',     color:'#2AA7B8', bg:'#020A12', cam:{x:0,y:0.00,z:1.00,dx:0.00,dy:-0.30,dz:0.06} },
    { id:'I', s:163.000,e:187.708,name:'SCENE I',       en:'PART I',      color:'#FFD9A0', bg:'#071018', cam:{x:0,y:0.30,z:1.00,dx:-0.20,dy:0.20,dz:0.03} },
    { id:'J', s:187.708,e:211.917,name:'SCENE J',     en:'PART J',     color:'#9EDCE8', bg:'#04121C', cam:{x:0,y:0.25,z:0.98,dx:0.00,dy:-0.20,dz:-0.02} },
    { id:'K', s:211.917,e:246.917,name:'SCENE K',     en:'PART K',      color:'#FFCF9A', bg:'#071018', cam:{x:0,y:0.00,z:1.00,dx:0.40,dy:-0.20,dz:0.02} },
    { id:'L', s:246.917,e:289.958,name:'SCENE L',     en:'PART L',  color:'#FFCF9A', bg:'#01060A', cam:{x:0,y:0.00,z:1.00,dx:0.00,dy:-0.10,dz:-0.02} },
    { id:'M', s:289.958,e:299.294,name:'SCENE M',       en:'PART M',      color:'#FFCF9A', bg:'#01060A', cam:{x:0,y:0.00,z:1.02,dx:0.00,dy:0.00,dz:0.00} }
  ];
  const secOf = t => SECTIONS.find(s => t >= s.s && t < s.e) || SECTIONS[SECTIONS.length - 1];

  // ---------------------------------------------------------------- camera arrays
  const camRows = [];
  SHOTS.forEach(function (sh) {
    const sec = SECTIONS.find(s => sh.s >= s.s - 0.001 && sh.s < s.e) || SECTIONS[0];
    const p = Math.max(0, Math.min(1, (sh.s - sec.s) / Math.max(0.001, sec.e - sec.s)));
    const txt = sh.cam || '';
    let x = sec.cam.x + sec.cam.dx * p + 0.24 * Math.sin(sh.n * 2.13);
    let y = sec.cam.y + sec.cam.dy * p + 0.10 * Math.cos(sh.n * 1.43);
    let z = sec.cam.z + sec.cam.dz * p + 0.024 * Math.sin(sh.n * 1.17);
    if (/推近/.test(txt)) z += 0.055;
    if (/后拉/.test(txt)) z -= 0.055;
    if (/横移/.test(txt)) x += (sh.n % 2 ? -0.38 : 0.38);
    if (/下移|下压|下沉/.test(txt)) y -= 0.40;
    if (/上移/.test(txt)) y += 0.30;
    if (/甩镜/.test(txt)) x += 0.80;
    if (/硬切/.test(txt)) z += 0.018;
    x = Math.max(-1.35, Math.min(1.35, x));
    y = Math.max(-2.4, Math.min(2.6, y));
    z = Math.max(0.90, Math.min(1.18, z));
    // within-shot eased drift (total, applied through f_l(t_c(0,1,u/Ld))[11])
    let dx = 0.012 * Math.sin(sh.n * 0.9), dy = 0.014 * Math.cos(sh.n * 1.1), dz = 0;
    if (/推近/.test(txt)) dz += 0.035;
    if (/后拉/.test(txt)) dz -= 0.035;
    if (/横移/.test(txt)) dx += (sh.n % 2 ? -0.20 : 0.20);
    if (/下移|下压|下沉/.test(txt)) dy -= 0.26;
    if (/上移/.test(txt)) dy += 0.20;
    if (/固定/.test(txt)) { dx *= 0.25; dy *= 0.25; }
    camRows.push({ x: +x.toFixed(3), y: +y.toFixed(3), z: +z.toFixed(3), dx: +dx.toFixed(3), dy: +dy.toFixed(3), dz: +dz.toFixed(3), d: +Math.max(0.4, sh.e - sh.s).toFixed(3) });
  });
  const listOf = key => '[' + camRows.map(r => r[key]).join(',') + ']';

  // ---------------------------------------------------------------- latex helpers
  const X = e => 'c_{z}\\left(' + e + '-c_{x}\\right)';
  const Y = e => 'c_{z}\\left(' + e + '-c_{y}\\right)';
  const W = (u, v) => '\\left(c_{x}+\\left(' + u + '\\right)/c_{z},c_{y}+\\left(' + v + '\\right)/c_{z}\\right)';
  const Wp = (u, v) => W(u, v);
  const pts = a => '\\left[' + a.map(p => W(p[0], p[1])).join(',') + '\\right]';
  const poly = a => '\\operatorname{polygon}\\left(' + pts(a) + '\\right)';
  const ringAt = (cx, cy, r) => '\\left(' + X('x') + '-\\left(' + cx + '\\right)\\right)^{2}+\\left(' + Y('y') + '-\\left(' + cy + '\\right)\\right)^{2}=\\left(' + r + '\\right)^{2}';
  const circle = ringAt;
  const ellipseAt = (cx, cy, rx, ry) => '\\left(\\frac{' + X('x') + '-\\left(' + cx + '\\right)}{' + rx + '}\\right)^{2}+\\left(\\frac{' + Y('y') + '-\\left(' + cy + '\\right)}{' + ry + '}\\right)^{2}<1';
  const cond = (c, a, b) => '\\left\\{' + c + ':' + a + ',' + b + '\\right\\}';
  const E = (id, latex, o) => Object.assign({ id: id, latex: latex }, o || {});
  const F = n => 'f_{l}\\left(t_{c}\\left(0,1,u/L_{d}\\left[K\\right]\\right)\\right)\\left[' + n + '\\right]';

  // ---------------------------------------------------------------- global definitions
  const globals = [
    E('T', 'T=0', { hidden: true }),
    E('K', 'K=1', { hidden: true }),
    E('ts', 't_s=0', { hidden: true }),
    E('u', 'u=T-t_s', { hidden: true }),
    E('S', 'S=1', { hidden: true }),
    E('Lx', 'L_{x}=' + listOf('x'), { hidden: true }),
    E('Ly', 'L_{y}=' + listOf('y'), { hidden: true }),
    E('Lz', 'L_{z}=' + listOf('z'), { hidden: true }),
    E('Ldx', 'D_{x}=' + listOf('dx'), { hidden: true }),
    E('Ldy', 'D_{y}=' + listOf('dy'), { hidden: true }),
    E('Ldz', 'D_{z}=' + listOf('dz'), { hidden: true }),
    E('Ld', 'L_{d}=' + listOf('d'), { hidden: true }),
    E('H', 'H=[' + IMPACTS.join(',') + ']', { hidden: true }),
    E('fl1', R`f_{l1}\left(x\right)=\left\{x<\frac{1}{2.75}:7.5625x^{2},x<\frac{2}{2.75}:7.5625\left(x-\frac{1.5}{2.75}\right)^{2}+0.75,x<\frac{2.5}{2.75}:7.5625\left(x-\frac{2.25}{2.75}\right)^{2}+0.9375,7.5625\left(x-\frac{2.625}{2.75}\right)^{2}+0.984375\right\}`, { hidden: true }),
    E('fl', R`f_{l}\left(x\right)=\left\{x\le0:0,x\ge1:1,\left[x,\operatorname{floor}\left(x\right),1-\cos\left(\frac{x\pi}{2}\right),\sin\left(\frac{x\pi}{2}\right),-\frac{\cos\left(\pi x\right)-1}{2},x^{2},1-\left(1-x\right)^{2},\left\{x<0.5:2x^{2},1-\frac{\left(-2x+2\right)^{2}}{2}\right\},x^{3},1-\left(1-x\right)^{3},\left\{x<0.5:4x^{3},1-\frac{\left(-2x+2\right)^{3}}{2}\right\},x^{4},1-\left(1-x\right)^{4},\left\{x<0.5:8x^{4},1-\frac{\left(-2x+2\right)^{4}}{2}\right\},x^{5},1-\left(1-x\right)^{5},\left\{x<0.5:16x^{5},1-\frac{\left(-2x+2\right)^{5}}{2}\right\},2^{10x-10},1-2^{-10x},\left\{x<0.5:\frac{2^{20x-10}}{2},\frac{2-2^{-20x+10}}{2}\right\},1-\sqrt{1-x^{2}},\sqrt{1-\left(x-1\right)^{2}},\left\{x<0.5:\frac{1-\sqrt{1-4x^{2}}}{2},\frac{\sqrt{1-\left(-2x+2\right)^{2}}+1}{2}\right\},c_{03}x^{3}-c_{01}x^{2},1+c_{03}\left(x-1\right)^{3}+c_{01}\left(x-1\right)^{2},\left\{x<0.5:\frac{4x^{2}\left(2\left(c_{02}+1\right)x-c_{02}\right)}{2},\frac{\left(2x-2\right)^{2}\left(\left(c_{02}+1\right)\left(2x-2\right)+c_{02}\right)+2}{2}\right\},\left\{x\ge1:1,-2^{10x-10}\sin\left(\left(10x-10.75\right)c_{04}\right)\right\},\left\{x\ge1:1,2^{-10x}\sin\left(\left(10x-0.75\right)c_{04}\right)+1\right\},\left\{x<0.5:-\frac{2^{20x-10}\sin\left(\left(20x-11.125\right)c_{05}\right)}{2},\frac{2^{-20x+10}\sin\left(\left(20x-11.125\right)c_{05}\right)}{2}+1\right\},1-f_{l1}\left(1-x\right),f_{l1}\left(x\right),\left\{x<0.5:\frac{1-f_{l1}\left(1-2x\right)}{2},\frac{1+f_{l1}\left(2x-1\right)}{2}\right\}\right]\right\}\operatorname{with}c_{01}=1.70158,c_{02}=2.5949095,c_{03}=2.70158,c_{04}=\frac{2\pi}{3},c_{05}=\frac{2\pi}{4.5}`, { hidden: true }),
    E('tc', R`t_{c}\left(a,b,t\right)=\max\left(0,\min\left(1,\frac{t-a}{b-a}\right)\right)`, { hidden: true }),
    E('m', R`m\left(t_{0},v_{0},t_{1},v_{1},t,w\right)=v_{0}+\left(v_{1}-v_{0}\right)f_{l}\left(t_{c}\left(t_{0},t_{1},t\right)\right)\left[w\right]`, { hidden: true }),
    E('p', 'p=\\min\\left(2.2,\\sum_{i=1}^{' + IMPACTS.length + '}0.74^{\\left|T-H\\left[i\\right]\\right|/0.075}\\right)', { hidden: true }),
    E('cx', 'c_{x}=L_{x}\\left[K\\right]+D_{x}\\left[K\\right]*' + F(11) + '+0.012p\\sin\\left(7T\\right)', { hidden: true }),
    E('cy', 'c_{y}=L_{y}\\left[K\\right]+D_{y}\\left[K\\right]*' + F(11) + '+0.008p\\cos\\left(9T\\right)', { hidden: true }),
    E('cz', 'c_{z}=L_{z}\\left[K\\right]+D_{z}\\left[K\\right]*' + F(11) + '+0.022p', { hidden: true }),
  ];

  // ---------------------------------------------------------------- global atmosphere
  const mid = [
    E('g_dust', W('\\operatorname{mod}\\left(7.13i,18\\right)-9+0.35\\sin\\left(0.25T+i\\right)', '\\operatorname{mod}\\left(0.31i+0.12T,11\\right)-5.5') + '\\operatorname{for}i=\\left[1...90\\right]', { color:'#7FD8E8', pointSize:'2.4+2.6p', pointOpacity:0.50 }),
    E('g_dust2', W('\\operatorname{mod}\\left(11.7i+3,20\\right)-10+0.45\\sin\\left(0.4T+2i\\right)', '\\operatorname{mod}\\left(0.19i+0.08T,12\\right)-6') + '\\operatorname{for}i=\\left[1...36\\right]', { color:'#9EDCE8', pointSize:'4.0+3.5p', pointOpacity:0.34 }),
    E('g_scan', '\\left|\\sin\\left(2.1' + Y('y') + '+0.11T\\right)\\right|<0.012', { color:'#2AA7B8', fillOpacity:0.09, lineOpacity:0 }),
    E('g_horizon', Y('y') + '=-4.55+0.12\\sin\\left(0.35' + X('x') + '+0.20T\\right)', { color:'#2AA7B8', lineWidth:'0.7+0.6p', lineOpacity:'0.10+0.05p' })
  ];
  const post = [
    E('g_ring', circle(0, 0, '4.2+0.45p'), { color:'#44E0D0', lineWidth:'1.0+2.4p', lineOpacity:'0.06+0.20p' })
  ];

  // ---------------------------------------------------------------- scenes
  const scenes = [];

  function scene(id, sec, bgColor, layers) {
    const bg = E('s' + id + '_bg', 'y<100', { color: bgColor, fillOpacity: 1, lineOpacity: 0, hidden: id !== 1 });
    const wash = E('s' + id + '_wash', 'y<100', { color: sec.color, fillOpacity: 0.018, lineOpacity: 0, hidden: id !== 1 });
    const all = [wash].concat(layers);
    all.forEach(e => { e.hidden = id !== 1; });
    scenes.push({ id, sec, bg, layers: all, ids: [bg.id].concat(all.map(e => e.id)) });
  }

  // ===== A / SCENE A =========================================================
  (function () {
    const c = SECTIONS[0].color;
    const surf = '2.42+0.30\\sin\\left(0.72' + X('x') + '+0.50T\\right)+0.10\\sin\\left(1.9' + X('x') + '-1.10T\\right)+0.06\\sin\\left(0.21T\\right)';
    scene(1, SECTIONS[0], SECTIONS[0].bg, [
      E('A_sky', Y('y') + '>2.00', { color:'#08222E', fillOpacity:0.55, lineOpacity:0 }),
      E('A_sea', Y('y') + '<' + surf, { color:'#0B3A4A', fillOpacity:0.55, lineOpacity:0 }),
      E('A_surf1', Y('y') + '=' + surf, { color:c, lineWidth:'1.8+1.2p', lineOpacity:'0.55+0.20p' }),
      E('A_surf2', Y('y') + '=2.31+0.32\\sin\\left(0.66' + X('x') + '+0.63T+1.1\\right)+0.09\\sin\\left(1.7' + X('x') + '-0.9T\\right)', { color:'#2AA7B8', lineWidth:1.0, lineOpacity:0.40 }),
      E('A_surf3', Y('y') + '=2.18+0.28\\sin\\left(0.61' + X('x') + '+0.82T+2.2\\right)', { color:'#2AA7B8', lineWidth:0.7, lineOpacity:0.28 }),
      E('A_ray1', X('x') + '=-3.10+0.35\\sin\\left(0.42' + Y('y') + '+0.18T\\right)\\left\\{' + Y('y') + '<2.32\\right\\}', { color:'#A8F0E8', lineWidth:'0.8+0.8p', lineOpacity:'0.10+0.06p' }),
      E('A_ray2', X('x') + '=0.55+0.28\\sin\\left(0.36' + Y('y') + '+0.26T+1.7\\right)\\left\\{' + Y('y') + '<2.32\\right\\}', { color:'#FFE7BC', lineWidth:'0.6+0.6p', lineOpacity:'0.08+0.05p' }),
      E('A_ray3', X('x') + '=3.85+0.32\\sin\\left(0.40' + Y('y') + '-0.14T+3.1\\right)\\left\\{' + Y('y') + '<2.32\\right\\}', { color:'#A8F0E8', lineWidth:'0.7+0.7p', lineOpacity:'0.09+0.05p' }),
      E('A_sunGlow3', '\\left(' + X('x') + '-0.20\\right)^{2}+\\left(' + Y('y') + '-3.05\\right)^{2}<7.2', { color:'#F0B36A', fillOpacity:0.025, lineOpacity:0 }),
      E('A_sunGlow2', '\\left(' + X('x') + '-0.20\\right)^{2}+\\left(' + Y('y') + '-3.05\\right)^{2}<2.7', { color:'#F0B36A', fillOpacity:0.065, lineOpacity:0 }),
      E('A_sunGlow1', '\\left(' + X('x') + '-0.20\\right)^{2}+\\left(' + Y('y') + '-3.05\\right)^{2}<1.0', { color:'#F0B36A', fillOpacity:0.11, lineOpacity:0 }),
      E('A_sunEdge', '\\left(' + X('x') + '-0.20\\right)^{2}+\\left(' + Y('y') + '-3.05\\right)^{2}=0.64^{2}', { color:'#FFE7BC', lineWidth:1.0, lineOpacity:'0.30+0.20p' }),
      E('A_sun', W('0.20', '3.05'), { color:'#F6BE76', pointSize:'78*m(18.8,1,40,0.16,T,18)+6p', pointOpacity:'0.95*m(18.8,1,39,0.22,T,19)' }),
      E('A_reflect', X('x') + '=0.30\\sin\\left(2.2' + Y('y') + '+0.6T\\right)\\left\\{-4.2<' + Y('y') + '<2.3\\right\\}', { color:'#FFD9A0', lineWidth:2.0, lineOpacity:'0.16+0.10p' }),
      E('A_glints', W('0.20+2.9\\sin\\left(0.9i+0.3T\\right)', '2.44+0.18\\sin\\left(1.2i+0.4T\\right)') + '\\operatorname{for}i=\\left[1...28\\right]', { color:'#FFE7BC', pointSize:'1.6+1.4p', pointOpacity:0.55 }),
      E('A_bubbles', W('0.20+1.8\\sin\\left(0.4i\\right)+0.12\\sin\\left(0.8T+i\\right)', '\\operatorname{mod}\\left(0.45i+0.25T,6.4\\right)-3.9') + '\\operatorname{for}i=\\left[1...24\\right]', { color:'#62D8D2', pointSize:3.2, pointOpacity:'0.55*m(13,0,16,1,T,5)' }),
      E('A_depth', '\\left|\\sin\\left(0.8' + Y('y') + '-0.08T\\right)\\right|<0.018', { color:'#2AA7B8', fillOpacity:'0.05*m(28,0,34,1,T,11)', lineOpacity:0 }),
      E('A_thermo1', Y('y') + '<-1.10+0.22\\sin\\left(0.38' + X('x') + '+0.12T\\right)', { color:'#041018', fillOpacity:0.16, lineOpacity:0 }),
      E('A_thermo2', Y('y') + '<-3.05+0.16\\sin\\left(0.30' + X('x') + '-0.10T\\right)', { color:'#020B12', fillOpacity:0.25, lineOpacity:0 }),
      E('A_thermoEdge', Y('y') + '=-1.10+0.22\\sin\\left(0.38' + X('x') + '+0.12T\\right)', { color:'#1E7A8C', lineWidth:0.8, lineOpacity:0.16 }),
      E('A_fade', 'y<100', { color:'#01060B', fillOpacity:'0.62*m(42,0,48.6,1,T,11)', lineOpacity:0 })
    ]);
  })();

  // ===== B / SCENE B ===========================================================
  (function () {
    const c = SECTIONS[1].color;
    const hit = (id, h) => {
      const tc = 't_{c}\\left(' + h + ',' + (h + 0.62).toFixed(2) + ',T\\right)';
      const ease = 'f_{l}\\left(' + tc + '\\right)\\left[19\\right]';
      return E(id, ringAt(0, 0, '0.25+2.6' + ease), {
        color: c, lineWidth: '0.8+1.4p',
        lineOpacity: cond('T>' + h, '0.60\\left(1-' + ease + '\\right)', '0')
      });
    };
    scene(2, SECTIONS[1], SECTIONS[1].bg, [
      E('B_top', Y('y') + '>1.35', { color:'#062A38', fillOpacity:0.45, lineOpacity:0 }),
      E('B_v1', W('\\left(0.14\\left(t+0.14T\\right)+0.35\\right)\\cos\\left(t+0.22T\\right)', '0.18+0.66\\left(0.14\\left(t+0.14T\\right)+0.35\\right)\\sin\\left(t+0.22T\\right)'), { color:'#2AA7B8', lineWidth:2.2, lineOpacity:'0.34+0.18p', parametricDomain:{min:'0',max:'22'} }),
      E('B_v2', W('\\left(0.14\\left(t+0.14T\\right)+0.35\\right)\\cos\\left(t+0.22T+2.1\\right)', '0.18+0.66\\left(0.14\\left(t+0.14T\\right)+0.35\\right)\\sin\\left(t+0.22T+2.1\\right)'), { color:'#44E0D0', lineWidth:1.7, lineOpacity:'0.26+0.16p', parametricDomain:{min:'0',max:'22'} }),
      E('B_v3', W('\\left(0.14\\left(t+0.14T\\right)+0.35\\right)\\cos\\left(t+0.22T+4.2\\right)', '0.18+0.66\\left(0.14\\left(t+0.14T\\right)+0.35\\right)\\sin\\left(t+0.22T+4.2\\right)'), { color:'#2AA7B8', lineWidth:1.2, lineOpacity:0.20, parametricDomain:{min:'0',max:'22'} }),
      E('B_cur1', Y('y') + '=1.05+0.42\\sin\\left(0.55' + X('x') + '+0.50T\\right)', { color:'#2AA7B8', lineWidth:1.0, lineOpacity:0.18 }),
      E('B_cur2', Y('y') + '=0.52+0.50\\sin\\left(0.45' + X('x') + '-0.40T+1.7\\right)', { color:'#2AA7B8', lineWidth:0.8, lineOpacity:0.13 }),
      E('B_debris', W('\\left(1.2+4.3\\operatorname{mod}\\left(0.61i,1\\right)\\right)\\cos\\left(0.50T+2.4i\\right)', '\\left(1.2+4.3\\operatorname{mod}\\left(0.61i,1\\right)\\right)\\sin\\left(0.50T+2.4i\\right)') + '\\operatorname{for}i=\\left[1...64\\right]', { color:'#7FD8E8', pointSize:2.4, pointOpacity:0.55 }),
      E('B_core', circle(0, 0, 0.52), { color:'#04121C', fillOpacity:1, lineOpacity:0 }),
      hit('B_hit1', 58.410), hit('B_hit2', 58.589), hit('B_hit3', 58.770), hit('B_hit4', 58.950),
      E('B_ribbon', W('\\left(0.14\\left(t+0.14T\\right)+0.35\\right)\\cos\\left(t+0.22T+0.8\\right)', '0.18+0.66\\left(0.14\\left(t+0.14T\\right)+0.35\\right)\\sin\\left(t+0.22T+0.8\\right)'), { color:'#7FE7E4', lineWidth:'5.0+2.0p', lineOpacity:'0.38+0.20p', parametricDomain:{min:'0',max:'20'} }),
      E('B_arc', circle(0, 0.18, '2.4+0.15p'), { color:'#7FE7E4', lineWidth:'1.5+1.5p', lineOpacity:'0.22+0.18p' }),
      E('B_light', Y('y') + '>2.55', { color:'#0A2A3A', fillOpacity:0.40, lineOpacity:0 })
    ]);
  })();

  // ===== C / SCENE C ===========================================================
  (function () {
    const c = SECTIONS[2].color;
    const s = '\\left(0.35+0.65*m(59.04,0,59.34,1,T,16)\\right)';
    const block = [
      ['-2.2*' + s, '-1.4*' + s], ['1.9*' + s, '-0.9*' + s], ['2.4*' + s, '1.2*' + s], ['-1.2*' + s, '1.6*' + s]
    ];
    scene(3, SECTIONS[2], SECTIONS[2].bg, [
      E('C_band1', '\\sin\\left(1.5\\left(' + X('x') + '\\cos\\left(0.6\\right)+' + Y('y') + '\\sin\\left(0.6\\right)\\right)-2.2T\\right)>0.62', { color:'#0B2E3E', fillOpacity:0.32, lineOpacity:0 }),
      E('C_band2', '\\sin\\left(1.4\\left(' + X('x') + '\\cos\\left(-0.5\\right)+' + Y('y') + '\\sin\\left(-0.5\\right)\\right)+2.0T\\right)>0.75', { color:'#0A3A48', fillOpacity:0.24, lineOpacity:0 }),
      E('C_band3', '\\left|\\sin\\left(3.2\\left(' + X('x') + '\\cos\\left(0.2\\right)+' + Y('y') + '\\sin\\left(0.2\\right)\\right)-3.0T\\right)\\right|<0.02', { color:'#44E0D0', fillOpacity:0.26, lineOpacity:0 }),
      E('C_block', poly(block), { color:'#0B2E3E', fillOpacity:0.55, lineWidth:'1.0+1.4p', lineOpacity:'0.35+0.30p' }),
      E('C_bubbles', W('\\operatorname{mod}\\left(5.1i+0.8T,18\\right)-9', '\\operatorname{mod}\\left(0.55i+0.42T,9\\right)-4.5') + '\\operatorname{for}i=\\left[1...48\\right]', { color:'#62D8D2', pointSize:'2.0+2.0p', pointOpacity:0.42 }),
      E('C_speed1', '\\left|\\sin\\left(4' + X('x') + '+6T\\right)\\right|<0.006', { color:'#62D8D2', fillOpacity:0.13, lineOpacity:0 }),
      E('C_speed2', '\\left|\\sin\\left(5' + Y('y') + '-4T\\right)\\right|<0.006', { color:'#44E0D0', fillOpacity:0.08, lineOpacity:0 }),
      E('C_core', circle(0, 0, '1.00+0.15p'), { color:'#7FE7E4', lineWidth:'2.0+2.0p', lineOpacity:'0.35+0.25p' }),
      E('C_flare', W('0', '0'), { color:'#E8FBFF', pointSize:'18+22p', pointOpacity:'0.55+0.2p' }),
      E('C_streak', Y('y') + '=0.20+0.45\\sin\\left(0.65' + X('x') + '-1.8T\\right)', { color:'#7FE7E4', lineWidth:'3.0+2.0p', lineOpacity:'0.25+0.20p' }),
      E('C_breath', '\\left(' + X('x') + '\\right)^{2}+\\left(' + Y('y') + '-0.1\\right)^{2}=\\left(0.7+1.5*m(67.62,0,69.33,1,T,11)\\right)^{2}', { color:'#A8F0E8', lineWidth:'0.9+1.2p', lineOpacity:'0.20+0.35p' }),
      E('C_dark', Y('y') + '<-3.4', { color:'#01060B', fillOpacity:0.45, lineOpacity:0 })
    ]);
  })();

  // ===== D / SCENE D ===========================================================
  (function () {
    const c = SECTIONS[3].color;
    scene(4, SECTIONS[3], SECTIONS[3].bg, [
      E('D_v1', W('\\left(0.13\\left(t+0.15T\\right)+0.40\\right)\\cos\\left(t+0.18T\\right)', '\\left(0.13\\left(t+0.15T\\right)+0.40\\right)\\sin\\left(t+0.18T\\right)'), { color:'#2AA7B8', lineWidth:1.0, lineOpacity:'0.28+0.18p', parametricDomain:{min:'0',max:'26'} }),
      E('D_v2', W('\\left(0.13\\left(t+0.15T\\right)+0.40\\right)\\cos\\left(t+0.18T+2.1\\right)', '\\left(0.13\\left(t+0.15T\\right)+0.40\\right)\\sin\\left(t+0.18T+2.1\\right)'), { color:'#44E0D0', lineWidth:0.8, lineOpacity:'0.20+0.14p', parametricDomain:{min:'0',max:'26'} }),
      E('D_v3', W('\\left(0.13\\left(t+0.15T\\right)+0.40\\right)\\cos\\left(t+0.18T+4.2\\right)', '\\left(0.13\\left(t+0.15T\\right)+0.40\\right)\\sin\\left(t+0.18T+4.2\\right)'), { color:'#2AA7B8', lineWidth:0.6, lineOpacity:0.16, parametricDomain:{min:'0',max:'26'} }),
      E('D_gridH', '\\left|\\sin\\left(2.4' + Y('y') + '+0.05T\\right)\\right|<0.012', { color:'#1E7A8C', fillOpacity:0.17, lineOpacity:0 }),
      E('D_gridV', '\\left|\\sin\\left(1.6' + X('x') + '-0.04T\\right)\\right|<0.008', { color:'#1E7A8C', fillOpacity:0.11, lineOpacity:0 }),
      E('D_ticks', W('-7.7', '-4.4+0.42i') + '\\operatorname{for}i=\\left[1...22\\right]', { color:'#7FD8E8', pointSize:2.4, pointOpacity:0.52 }),
      E('D_debris', W('\\left(1.5+4.8\\operatorname{mod}\\left(0.57i,1\\right)\\right)\\cos\\left(-0.42T+2.2i\\right)', '\\left(1.5+4.8\\operatorname{mod}\\left(0.57i,1\\right)\\right)\\sin\\left(-0.42T+2.2i\\right)') + '\\operatorname{for}i=\\left[1...76\\right]', { color:'#7FD8E8', pointSize:2.0, pointOpacity:0.48 }),
      E('D_core', circle(0, 0, 0.48), { color:'#020A12', fillOpacity:1, lineOpacity:0 }),
      E('D_ring', circle(0, 0, '3.2+0.55p'), { color:c, lineWidth:'0.7+1.4p', lineOpacity:'0.12+0.16p' }),
      E('D_light', Y('y') + '>2.6', { color:'#0A2A3A', fillOpacity:0.28, lineOpacity:0 })
    ]);
  })();

  // ===== E / SCENE E ===========================================================
  (function () {
    const c = SECTIONS[4].color;
    const shout = (id, delay, radius) => {
      const a = 112.0 + delay, b = 113.4 + delay;
      const tc = 't_{c}\\left(' + a + ',' + b.toFixed(2) + ',T\\right)';
      const ease = 'f_{l}\\left(' + tc + '\\right)\\left[19\\right]';
      return E(id, circle(2.2, 0.4, radius), {
        color:'#BFE3EA', lineWidth:'2.4+3.2p',
        lineOpacity: cond('T>' + a, '0.85\\left(1-' + ease + '\\right)', '0')
      });
    };
    scene(5, SECTIONS[4], SECTIONS[4].bg, [
      E('E_crack1', poly([['-9.6', '5.7'], ['-2.35', '2.55'], ['-2.62', '2.28'], ['-9.6', '4.15']]), { color:'#0A2A3A', fillOpacity:0.10, lineWidth:0.6, lineOpacity:0.18 }),
      E('E_crack2', poly([['-9.6', '4.20'], ['-2.36', '2.45'], ['-2.48', '2.32'], ['-9.6', '3.80']]), { color:'#BFE3EA', fillOpacity:0.16, lineWidth:0.8, lineOpacity:0.35 }),
      E('E_dust', W('\\operatorname{mod}\\left(5.7i,19\\right)-9.5', '\\operatorname{mod}\\left(0.27i+0.03T,11\\right)-5.5') + '\\operatorname{for}i=\\left[1...48\\right]', { color:'#7FD8E8', pointSize:'1.8+1.8p', pointOpacity:0.42 }),
      E('E_depth', '\\left|\\sin\\left(0.62' + Y('y') + '+0.10T\\right)\\right|<0.015', { color:c, fillOpacity:0.06, lineOpacity:0 }),
      E('E_crackCore', Y('y') + '=1.88-0.2417' + X('x') + '\\left\\{' + X('x') + '<-2.3\\right\\}', { color:'#E8FBFF', lineWidth:'1.0+2.0p', lineOpacity:'0.55+0.25p' }),
      E('E_beam', Y('y') + '=0.4+0.03\\sin\\left(0.3T\\right)\\left\\{-9.6<' + X('x') + '\\right\\}', { color:'#BFE3EA', lineWidth:'0.5+0.8p', lineOpacity:'0.07+0.06p' }),
      shout('E_shout1', 0.00, '0.35+7.0f_{l}\\left(t_{c}\\left(112,113.4,T\\right)\\right)\\left[19\\right]'),
      shout('E_shout2', 0.12, '0.55+8.2f_{l}\\left(t_{c}\\left(112.12,113.52,T\\right)\\right)\\left[19\\right]'),
      shout('E_shout3', 0.24, '0.75+9.4f_{l}\\left(t_{c}\\left(112.24,113.64,T\\right)\\right)\\left[19\\right]'),
      E('E_point', W('2.2', '0.4'), { color:'#E8FBFF', pointSize:'12+22p', pointOpacity:cond('T>111.9', '0.9', '0') }),
      E('E_voidRing', circle(2.2, 0.4, 4.6), { color:'#BFE3EA', lineWidth:'0.6+0.8p', lineOpacity:'0.10+0.08p' }),
      E('E_shoutPoint', W('2.2', '0.4'), { color:'#E8FBFF', pointSize:'8+58\\left(1-f_{l}\\left(t_{c}\\left(112,113.2,T\\right)\\right)\\left[19\\right]\\right)', pointOpacity:cond('T>112', '0.9', '0') }),
      E('E_shoutBeam', Y('y') + '=0.4\\left\\{' + X('x') + '>2.2\\right\\}\\left\\{T>112\\right\\}', { color:'#BFE3EA', lineWidth:'1.5+3.0p', lineOpacity:cond('T>112', '0.55\\left(1-f_{l}\\left(t_{c}\\left(112,113.4,T\\right)\\right)\\left[19\\right]\\right)', '0') }),
      E('E_fade', 'y<100', { color:'#01060B', fillOpacity:'0.20*m(93,0,100,1,T,11)', lineOpacity:0 })
    ]);
  })();

  // ===== F / SCENE F ===========================================================
  (function () {
    const c = SECTIONS[5].color;
    const breath = '1+0.12\\sin\\left(\\pi\\left(T-116.25\\right)/2.167\\right)';
    scene(6, SECTIONS[5], SECTIONS[5].bg, [
      E('F_r1', circle(0, 0, '1.0*' + breath), { color:c, lineWidth:1.2, lineOpacity:0.45 }),
      E('F_r2', circle(0, 0, '1.45*' + breath), { color:'#44E0D0', lineWidth:0.9, lineOpacity:0.25 }),
      E('F_r3', circle(0, 0, '0.62*' + breath), { color:'#A8F0E8', lineWidth:1.4, lineOpacity:0.55 }),
      E('F_dust', W('\\left(2.6+1.4\\operatorname{mod}\\left(0.63i,1\\right)\\right)\\cos\\left(6.283\\operatorname{mod}\\left(0.37i,1\\right)+0.2T\\right)\\left(1-0.75t_{c}\\left(116.25,118.0,T\\right)\\right)', '\\left(2.6+1.4\\operatorname{mod}\\left(0.63i,1\\right)\\right)\\sin\\left(6.283\\operatorname{mod}\\left(0.37i,1\\right)+0.2T\\right)\\left(1-0.75t_{c}\\left(116.25,118.0,T\\right)\\right)') + '\\operatorname{for}i=\\left[1...40\\right]', { color:'#7FD8E8', pointSize:2.2, pointOpacity:0.5 })
    ]);
  })();

  // ===== G / SCENE G ===========================================================
  (function () {
    const c = SECTIONS[6].color;
    const red = '#FF5A6E';
    scene(7, SECTIONS[6], SECTIONS[6].bg, [
      E('G_ring1', circle(0, 0, 2.45), { color:c, lineWidth:'1.8+1.4p', lineOpacity:'0.42+0.22p' }),
      E('G_ring2', circle(0, 0, 2.05), { color:'#1E7A8C', lineWidth:0.9, lineOpacity:0.28 }),
      E('G_ticks', W('2.28\\cos\\left(0.2618i\\right)', '2.28\\sin\\left(0.2618i\\right)') + '\\operatorname{for}i=\\left[1...48\\right]', { color:'#7FD8E8', pointSize:'2.2+2.2p', pointOpacity:0.75 }),
      E('G_wallL', X('x') + '<-5.4+0.35\\sin\\left(0.2T\\right)', { color:'#01030A', fillOpacity:0.55, lineOpacity:0 }),
      E('G_wallR', X('x') + '>5.4-0.35\\sin\\left(0.2T\\right)', { color:'#01030A', fillOpacity:0.55, lineOpacity:0 }),
      E('G_red1', Y('y') + '=1.15+0.02\\sin\\left(0.4T\\right)', { color:red, lineWidth:0.8, lineOpacity:cond('T>118.417', '0.40+0.15p', '0') }),
      E('G_red2', '\\left(' + X('x') + '-0.0\\right)^{2}+\\left(' + Y('y') + '\\right)^{2}=2.12^{2}', { color:red, lineWidth:0.8, lineOpacity:cond('T>118.417', '0.20+0.10p', '0') }),
      E('G_red3', Y('y') + '=-1.6+0.02\\sin\\left(0.5T+1\\right)', { color:red, lineWidth:0.7, lineOpacity:cond('T>125', '0.18+0.10p', '0') }),
      E('G_needle', W('2.05t\\cos\\left(0.5+0.02\\left(T-118.417\\right)\\right)', '2.05t\\sin\\left(0.5+0.02\\left(T-118.417\\right)\\right)'), { color:'#FFE7BC', lineWidth:'1.4+1.0p', lineOpacity:'0.55+0.20p', parametricDomain:{min:'0',max:'1'} }),
      E('G_pulse', circle(0, 0, '0.8+1.8p'), { color:c, lineWidth:'0.6+1.4p', lineOpacity:'0.10+0.14p' })
    ]);
  })();

  // ===== H / SCENE H =============================================================
  (function () {
    const c = SECTIONS[7].color;
    const ellipse = (id, r, op) => E(id, '\\left(' + X('x') + '/\\left(' + r + '\\right)\\right)^{2}+\\left(' + Y('y') + '/\\left(0.62\\left(' + r + '\\right)\\right)\\right)^{2}=1', { color:c, lineWidth:'1.2+1.4p', lineOpacity:op });
    scene(8, SECTIONS[7], SECTIONS[7].bg, [
      ellipse('H_t1', '1.2+0.06\\sin\\left(0.6T\\right)', 0.42),
      ellipse('H_t2', '2.1+0.10\\sin\\left(0.6T+1\\right)', 0.28),
      ellipse('H_t3', '3.3+0.14\\sin\\left(0.6T+2\\right)', 0.18),
      ellipse('H_t4', '4.8+0.18\\sin\\left(0.6T+3\\right)', 0.12),
      E('H_v1', W('\\left(0.15\\left(t+0.15T\\right)+0.30\\right)\\cos\\left(t+0.2T\\right)', '\\left(0.15\\left(t+0.15T\\right)+0.30\\right)\\sin\\left(t+0.2T\\right)'), { color:'#2AA7B8', lineWidth:0.9, lineOpacity:'0.22+0.16p', parametricDomain:{min:'0',max:'26'} }),
      E('H_v2', W('\\left(0.15\\left(t+0.15T\\right)+0.30\\right)\\cos\\left(t+0.2T+2.1\\right)', '\\left(0.15\\left(t+0.15T\\right)+0.30\\right)\\sin\\left(t+0.2T+2.1\\right)'), { color:'#44E0D0', lineWidth:0.7, lineOpacity:'0.18+0.14p', parametricDomain:{min:'0',max:'26'} }),
      E('H_core', circle(0, 0, 0.55), { color:'#020A12', fillOpacity:1, lineOpacity:0 }),
      E('H_slit', Y('y') + '=1.35+0.02\\sin\\left(0.4T\\right)', { color:'#FFD9A0', lineWidth:'0.5+0.8p', lineOpacity:cond('T>160.5', '0.18+0.10p', '0') }),
      E('H_slitGlow', '\\left|' + Y('y') + '-1.35\\right|<0.12\\left\\{' + X('x') + '>-3\\right\\}\\left\\{' + X('x') + '<4\\right\\}', { color:'#FFD9A0', fillOpacity:cond('T>160.5', '0.045', '0'), lineOpacity:0 })
    ]);
  })();

  // ===== I / SCENE I =============================================================
  (function () {
    const c = SECTIONS[8].color;
    const prog = 'm(182.6,0.15,184.6,1,T,19)';
    const ex = '5.2-9.6*' + prog, ey = '1.55+0.35\\sin\\left(0.5T\\right)';
    scene(9, SECTIONS[8], SECTIONS[8].bg, [
      E('I_shaft1', poly([['1.6', '5.8'], ['4.4', '5.8'], ['1.2', '-2.6'], ['0.2', '-2.4']]), { color:'#FFD9A0', fillOpacity:'0.10+0.05p', lineOpacity:0 }),
      E('I_shaft2', poly([['2.4', '5.8'], ['3.5', '5.8'], ['1.35', '-1.8'], ['0.85', '-1.7']]), { color:'#FFE7BC', fillOpacity:'0.14+0.06p', lineOpacity:0 }),
      E('I_shaft3', poly([['2.85', '5.8'], ['3.15', '5.8'], ['1.45', '-1.2'], ['1.25', '-1.2']]), { color:'#FFF0D0', fillOpacity:0.20, lineOpacity:0 }),
      E('I_crack', poly([['-9.8', '1.66'], ['4.8', '1.40'], ['4.8', '1.36'], ['-9.8', '1.56']]), { color:'#FFF0D0', fillOpacity:'0.22+0.08p', lineWidth:'0.6+0.8p', lineOpacity:'0.55+0.25p' }),
      E('I_dust', W('\\operatorname{mod}\\left(6.1i,19\\right)-9.5', '\\operatorname{mod}\\left(0.23i+0.04T,11\\right)-5.5') + '\\operatorname{for}i=\\left[1...54\\right]', { color:'#FFE7BC', pointSize:'1.2+1.6p', pointOpacity:0.30 }),
      E('I_contour1', W('2.8+1.05\\cos\\left(t\\right)+0.18\\sin\\left(3t\\right)', '-0.9+1.55\\sin\\left(t\\right)+0.12\\sin\\left(2t\\right)'), { color:'#FFD9A0', lineWidth:1.0, lineOpacity:0.38, parametricDomain:{min:'0',max:'6.283'} }),
      E('I_contour2', W('3.25+1.05\\cos\\left(t+0.4\\right)+0.16\\sin\\left(3t\\right)', '-0.75+1.55\\sin\\left(t+0.4\\right)+0.10\\sin\\left(2t\\right)'), { color:'#9EDCE8', lineWidth:0.9, lineOpacity:0.30, parametricDomain:{min:'0',max:'6.283'} }),
      E('I_reach', W('-8.2+10.0*' + prog + 't', '-4.7+5.6*' + prog + 't+0.25\\sin\\left(3t\\right)'), { color:'#FFD9A0', lineWidth:'1.2+1.6p', lineOpacity:'0.55+0.25p', parametricDomain:{min:'0',max:'1'} }),
      E('I_star', '\\operatorname{polygon}\\left(\\left(' + W('0.45\\left(1-0.62\\operatorname{mod}\\left(i,2\\right)\\right)\\cos\\left(1.5708i+0.7854\\right)+' + ex, '0.45\\left(1-0.62\\operatorname{mod}\\left(i,2\\right)\\right)\\sin\\left(1.5708i+0.7854\\right)+' + ey) + '\\right)\\operatorname{for}i=\\left[1...8\\right]\\right)', { color:'#FFF0D0', fillOpacity:0.35, lineWidth:1.0, lineOpacity:0.75 }),
      E('I_starGlow', circle(ex, ey, '1.4+0.12p'), { color:'#FFD9A0', fillOpacity:0, lineWidth:1.1, lineOpacity:'0.20+0.10p' }),
      E('I_plate', poly([['-10', '5.8'], ['10', '5.8'], ['10', '4.9'], ['-10', '5.1']]), { color:'#FFD9A0', fillOpacity:'0.10*m(187.6,1,187.9,0.2,T,16)', lineOpacity:0 })
    ]);
  })();

  // ===== J / SCENE J ===========================================================
  (function () {
    const c = SECTIONS[9].color;
    const shard = (id, x, y, s, ph) => E(id, poly([[x - s, y - 0.4 * s], [x + 0.7 * s, y - 0.2 * s], [x + 0.4 * s, y + 0.6 * s], [x - 0.7 * s, y + 0.35 * s]]), { color:c, fillOpacity:0.12, lineWidth:1.2, lineOpacity:0.68 });
    scene(10, SECTIONS[9], SECTIONS[9].bg, [
      E('J_beam1', poly([['-8.5', '5.7'], ['-6.8', '5.7'], ['-1.2', '-3.5'], ['-2.6', '-3.5']]), { color:'#9EDCE8', fillOpacity:0.08, lineOpacity:0 }),
      E('J_beam2', poly([['6.5', '5.7'], ['8.2', '5.7'], ['3.2', '-3.2'], ['2.0', '-3.2']]), { color:'#FFD9A0', fillOpacity:0.07, lineOpacity:0 }),
      E('J_beam3', poly([['-1.2', '5.7'], ['0.4', '5.7'], ['-0.2', '-4.0'], ['-1.2', '-4.0']]), { color:'#9EDCE8', fillOpacity:0.09, lineOpacity:0 }),
      shard('J_sh1', -4.2, 1.6, 0.85), shard('J_sh2', -1.4, 2.4, 0.62), shard('J_sh3', 3.8, 0.8, 0.95),
      shard('J_sh4', 0.6, 1.15, 0.55), shard('J_sh5', -3.0, -0.35, 0.70), shard('J_sh6', 2.2, -0.9, 0.48),
      E('J_dust', W('\\operatorname{mod}\\left(6.7i,19\\right)-9.5', '\\operatorname{mod}\\left(0.21i+0.03T,11\\right)-5.5') + '\\operatorname{for}i=\\left[1...42\\right]', { color:'#9EDCE8', pointSize:'1.2+1.4p', pointOpacity:0.34 }),
      E('J_line', Y('y') + '=0.2+0.02\\sin\\left(0.5T\\right)', { color:c, lineWidth:'0.5+1.0p', lineOpacity:'0.25+0.20p' }),
      E('J_breath', W('0', '0.2'), { color:'#FFD9A0', pointSize:'20+18p', pointOpacity:0.55 }),
      E('J_ring', circle(0, 0.2, '1.0+0.06\\sin\\left(0.9T\\right)+0.2p'), { color:'#FFD9A0', lineWidth:0.8, lineOpacity:'0.18+0.10p' })
    ]);
  })();

  // ===== K / SCENE K ===========================================================
  (function () {
    const c = SECTIONS[10].color;
    const pathX = '3.2\\sin\\left(0.42T\\right)+0.8\\sin\\left(0.9T\\right)';
    const pathY = '1.4\\cos\\left(0.53T\\right)-0.3';
    scene(11, SECTIONS[10], SECTIONS[10].bg, [
      E('K_band1', '\\sin\\left(1.8\\left(' + X('x') + '\\cos\\left(0.4\\right)+' + Y('y') + '\\sin\\left(0.4\\right)\\right)-3.0T\\right)>0.72', { color:'#0B2E3E', fillOpacity:0.30, lineOpacity:0 }),
      E('K_band2', '\\left|\\sin\\left(4.2\\left(' + X('x') + '\\cos\\left(-0.3\\right)+' + Y('y') + '\\sin\\left(-0.3\\right)\\right)-5.0T\\right)\\right|<0.008', { color:'#44E0D0', fillOpacity:0.24, lineOpacity:0 }),
      E('K_chase', W(pathX, pathY), { color:'#FFF0D0', pointSize:'7+10p', pointOpacity:0.95 }),
      E('K_trail1', W(pathX.replace(/T/g, '(T-0.055)'), pathY.replace(/T/g, '(T-0.055)')), { color:'#FFCF9A', pointSize:'5+6p', pointOpacity:0.35 }),
      E('K_trail2', W(pathX.replace(/T/g, '(T-0.11)'), pathY.replace(/T/g, '(T-0.11)')), { color:'#FFCF9A', pointSize:'4+4p', pointOpacity:0.20 }),
      E('K_seabed1', poly([['-10', '-5.8'], ['-0.6', '-4.4'], ['-0.6', '-3.7'], ['-10', '-4.9']]), { color:'#02070D', fillOpacity:0.85, lineWidth:0.6, lineOpacity:0.25 }),
      E('K_seabed2', poly([['10', '-5.8'], ['0.6', '-4.4'], ['0.6', '-3.7'], ['10', '-4.9']]), { color:'#02070D', fillOpacity:0.85, lineWidth:0.6, lineOpacity:0.25 }),
      E('K_chaseGlow', circle(pathX, pathY, '1.65+0.3p'), { color:'#FFCF9A', fillOpacity:0.035, lineWidth:0.8, lineOpacity:'0.15+0.10p' }),
      E('K_drop', W('-4.4', '1.5'), { color:'#9EDCE8', pointSize:'24+6p', pointOpacity:0.35 }),
      E('K_dropRing', circle(-4.4, 1.5, '0.55+0.04\\sin\\left(1.1T\\right)'), { color:'#BFE3EA', lineWidth:0.9, lineOpacity:0.45 }),
      E('K_pray1', W('4.6', '2.4'), { color:'#FFD9A0', pointSize:'12+10p', pointOpacity:cond('T>242.1', '0.8', '0') }),
      E('K_pray2', W('5.2', '1.9'), { color:'#FFD9A0', pointSize:'9+8p', pointOpacity:cond('T>242.5', '0.8', '0') }),
      E('K_prayGlow1', circle(4.6, 2.4, '1.2+0.2p'), { color:'#FFD9A0', lineWidth:0.7, lineOpacity:cond('T>242.1', '0.18', '0') }),
      E('K_prayGlow2', circle(5.2, 1.9, '0.9+0.2p'), { color:'#FFD9A0', lineWidth:0.7, lineOpacity:cond('T>242.5', '0.16', '0') })
    ]);
  })();

  // ===== L / SCENE L ===========================================================
  (function () {
    const c = SECTIONS[11].color;
    scene(12, SECTIONS[11], SECTIONS[11].bg, [
      E('L_heart', W('0', '0.15'), { color:'#FFCF9A', pointSize:'30+26p', pointOpacity:'0.70+0.25p' }),
      E('L_glow1', circle(0, 0.15, '1.35+0.35p'), { color:'#FFCF9A', fillOpacity:0.05, lineWidth:0.9, lineOpacity:'0.18+0.12p' }),
      E('L_glow2', circle(0, 0.15, '3.0+0.7p'), { color:'#FFCF9A', fillOpacity:0.025, lineWidth:0.7, lineOpacity:'0.10+0.08p' }),
      E('L_orbit', W('\\left(1.5+1.2\\operatorname{mod}\\left(0.37i,1\\right)\\right)\\cos\\left(0.16T+3.1i\\right)', '\\left(1.5+1.2\\operatorname{mod}\\left(0.37i,1\\right)\\right)\\sin\\left(0.16T+3.1i\\right)+0.15') + '\\operatorname{for}i=\\left[1...7\\right]', { color:'#9EDCE8', pointSize:2.6, pointOpacity:0.45 }),
      E('L_melody', W('3.2\\sin\\left(0.5\\left(T-263.15\\right)+1.2i\\right)', '1.8\\cos\\left(0.37\\left(T-263.15\\right)+2.1i\\right)') + '\\operatorname{for}i=\\left[1...12\\right]', { color:'#FFE7BC', pointSize:'2.0+3.0p', pointOpacity:cond('T>263.1', '0.55', '0') }),
      E('L_water', Y('y') + '=-4.55+0.10\\sin\\left(0.4' + X('x') + '+0.2T\\right)', { color:'#2AA7B8', lineWidth:0.8, lineOpacity:0.22 }),
      E('L_line', Y('y') + '=0.15+0.02\\sin\\left(0.3T\\right)', { color:c, lineWidth:'0.5+0.8p', lineOpacity:'0.18+0.10p' }),
      E('L_pulse', circle(0, 0.15, '3.0+0.4p'), { color:'#FFCF9A', lineWidth:0.6, lineOpacity:'0.05+0.05p' })
    ]);
  })();

  // ===== M / SCENE M =============================================================
  (function () {
    const c = SECTIONS[12].color;
    scene(13, SECTIONS[12], SECTIONS[12].bg, [
      E('M_water', Y('y') + '=-4.45+0.08\\sin\\left(0.3' + X('x') + '+0.15T\\right)', { color:'#2AA7B8', lineWidth:0.7, lineOpacity:0.17 }),
      E('M_reach', W('-4.6+9.0t', '-3.7+4.7t+0.18\\sin\\left(2.4t\\right)'), { color:c, lineWidth:'1.0+1.4p', lineOpacity:0.62, parametricDomain:{min:'0',max:'1'} }),
      E('M_star', W('4.4', '1.0'), { color:'#FFF0D0', pointSize:'20+18p', pointOpacity:'0.85+0.15p' }),
      E('M_glow', circle(4.4, 1.0, '1.6+0.3p'), { color:'#FFD9A0', fillOpacity:0.055, lineWidth:1.0, lineOpacity:0.28 }),
      E('M_line2', Y('y') + '=1.0+0.04\\sin\\left(0.4T\\right)', { color:c, lineWidth:0.5, lineOpacity:0.15 })
    ]);
  })();

  // ---------------------------------------------------------------- assemble
  const used = new Set();
  function dedupe(list) {
    return list.filter(e => { if (used.has(e.id)) return false; used.add(e.id); return true; });
  }
  const g = dedupe(globals);
  const m = dedupe(mid);
  const p = dedupe(post);
  const bgs = scenes.map(s => s.bg);
  const lays = [];
  scenes.forEach(s => s.layers.forEach(e => lays.push(e)));
  const all = g.concat(bgs, m, dedupe(lays), p);

  return {
    SECTIONS: SECTIONS,
    sections: SECTIONS,
    scenes: scenes,
    globals: g,
    mid: m,
    post: p,
    backgrounds: bgs,
    layers: lays,
    all: all,
    camRows: camRows,
    secOf: secOf
  };
})();