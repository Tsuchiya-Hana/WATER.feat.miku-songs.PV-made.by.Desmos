// Minimal CDP screenshot: node capture.cjs <url> <out.png>
const [url, out] = process.argv.slice(2);
const fs = require('fs');
(async () => {
  const version = await (await fetch('http://127.0.0.1:9333/json/version')).json();
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { resolve } = pending.get(m.id); pending.delete(m.id); resolve(m); }
  };
  await new Promise(r => ws.onopen = r);
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id; pending.set(mid, { resolve });
    ws.send(JSON.stringify({ id: mid, method, params }));
    setTimeout(() => { if (pending.has(mid)) { pending.delete(mid); reject(new Error('timeout ' + method)); } }, 30000);
  });
  const created = await send('Target.createTarget', { url: 'about:blank' });
  const targetId = created.result.targetId;
  const attached = await send('Target.attachToTarget', { targetId, flatten: true });
  const sid = attached.result.sessionId;
  const S = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id; pending.set(mid, { resolve });
    ws.send(JSON.stringify({ id: mid, method, params, sessionId: sid }));
    setTimeout(() => { if (pending.has(mid)) { pending.delete(mid); reject(new Error('timeout ' + method)); } }, 60000);
  });
  await S('Page.enable'); await S('Runtime.enable');
  await S('Emulation.setDeviceMetricsOverride', { width: 1600, height: 900, deviceScaleFactor: 1, mobile: false });
  await S('Network.enable'); await S('Network.setCacheDisabled', { cacheDisabled: true });
  await S('Page.navigate', { url });
  await new Promise(r => setTimeout(r, 14000));
  const err = await S('Runtime.evaluate', { expression: 'window.__analysis ? JSON.stringify(window.__analysis()) : "no"', returnByValue: true });
  console.log('ERRS', err.result?.result?.value);
  const shot = await S('Page.captureScreenshot', { format: 'png', fromSurface: true });
  fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
  console.log('SHOT', out, fs.statSync(out).size);
  await send('Target.closeTarget', { targetId });
  process.exit(0);
})();
