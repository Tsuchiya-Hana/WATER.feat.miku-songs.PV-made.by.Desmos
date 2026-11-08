/* Export the exact Desmos expression list that the MV passes to setExpressions(). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'src', 'data.js'), 'utf8'), ctx, { filename: 'data.js' });
vm.runInContext(fs.readFileSync(path.join(root, 'src', 'scenes.js'), 'utf8'), ctx, { filename: 'scenes.js' });

const SC = ctx.window.WATER_SCENES;
const group = new Map();
SC.globals.forEach(e => group.set(e.id, '0 GLOBAL / 定义与相机'));
SC.scenes.forEach(s => {
  group.set(s.bg.id, '1 BACKGROUND / ' + s.sec.id);
  s.layers.forEach(e => group.set(e.id, '2 LAYERS / ' + s.sec.id));
});
SC.mid.forEach(e => group.set(e.id, '3 ATMOSPHERE / 全局'));
SC.post.forEach(e => group.set(e.id, '4 POST / 全局'));

const styleKeys = ['hidden', 'color', 'lineWidth', 'lineStyle', 'lineOpacity', 'pointSize', 'pointStyle', 'pointOpacity', 'fillOpacity', 'fill', 'parametricDomain', 'secret'];
const lines = [];
lines.push('WATER feat. miku — Desmos 表达式栏导出');
lines.push('由 index.html 实际调用 calculator.setExpressions() 的数组生成。');
lines.push('说明：网页默认隐藏表达式栏；打开 index.html?expr=1 可显示它。');
lines.push('表达式总数：' + SC.all.length + '；场景：' + SC.scenes.length + '；镜头：' + ctx.window.WATER_DATA.SHOTS.length + '；字幕：' + ctx.window.WATER_DATA.CUES.length);
lines.push('');

let currentGroup = '';
SC.all.forEach((e, i) => {
  const g = group.get(e.id) || '9 UNGROUPED';
  if (g !== currentGroup) {
    currentGroup = g;
    lines.push('');
    lines.push('/* ===================== ' + g + ' ===================== */');
  }
  const no = String(i + 1).padStart(3, '0');
  const style = [];
  for (const k of styleKeys) {
    if (Object.prototype.hasOwnProperty.call(e, k)) {
      const v = e[k];
      style.push(k + '=' + (typeof v === 'string' ? '"' + v + '"' : JSON.stringify(v)));
    }
  }
  lines.push('#' + no + ' [' + g + '] id=' + e.id + (style.length ? '  ' + style.join('  ') : ''));
  lines.push(e.latex);
  lines.push('');
});
fs.writeFileSync(path.join(root, 'Desmos表达式栏.txt'), lines.join('\n'), 'utf8');
fs.writeFileSync(path.join(root, 'desmos_expressions.json'), JSON.stringify(SC.all, null, 1), 'utf8');
console.log('expressions', SC.all.length);
console.log('wrote Desmos表达式栏.txt and desmos_expressions.json');
