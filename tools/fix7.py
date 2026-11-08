# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
s = open(p, encoding='utf-8').read()

old_circle = "  const circle = (cx, cy, r) => X('x') + '^{2}+' + Y('y') + '^{2}=' + r + '^{2}';\n  const ringAt = (cx, cy, r) => '\\\\left(' + X('x') + '-' + cx + '\\\\right)^{2}+\\\\left(' + Y('y') + '-' + cy + '\\\\right)^{2}=' + r + '^{2}';"
new_circle = "  const ringAt = (cx, cy, r) => '\\\\left(' + X('x') + '-\\\\left(' + cx + '\\\\right)\\\\right)^{2}+\\\\left(' + Y('y') + '-\\\\left(' + cy + '\\\\right)\\\\right)^{2}=' + r + '^{2}';\n  const circle = ringAt;\n  const ellipseAt = (cx, cy, rx, ry) => '\\\\left(\\\\frac{' + X('x') + '-\\\\left(' + cx + '\\\\right)}{' + rx + '}\\\\right)^{2}+\\\\left(\\\\frac{' + Y('y') + '-\\\\left(' + cy + '\\\\right)}{' + ry + '}\\\\right)^{2}<1';"
if old_circle not in s:
    print('circle pattern not found')
else:
    s = s.replace(old_circle, new_circle)

old_scene = """  function scene(id, sec, bgColor, layers) {
    const bg = E('s' + id + '_bg', 'y<100', { color: bgColor, fillOpacity: 1, lineOpacity: 0, hidden: id !== 1 });
    layers.forEach(e => { e.hidden = id !== 1; });
    scenes.push({ id, sec, bg, layers, ids: [bg.id].concat(layers.map(e => e.id)) });
  }"""
new_scene = """  function scene(id, sec, bgColor, layers) {
    const bg = E('s' + id + '_bg', 'y<100', { color: bgColor, fillOpacity: 1, lineOpacity: 0, hidden: id !== 1 });
    const wash = E('s' + id + '_wash', 'y<100', { color: sec.color, fillOpacity: 0.030, lineOpacity: 0, hidden: id !== 1 });
    const fog1 = E('s' + id + '_fog1', ellipseAt(0, 0, 9, 6), { color: sec.color, fillOpacity: 0.050, lineOpacity: 0, hidden: id !== 1 });
    const fog2 = E('s' + id + '_fog2', ellipseAt(0, 0, 5.2, 3.5), { color: sec.color, fillOpacity: 0.075, lineOpacity: 0, hidden: id !== 1 });
    const all = [wash, fog1, fog2].concat(layers);
    all.forEach(e => { e.hidden = id !== 1; });
    scenes.push({ id, sec, bg, layers: all, ids: [bg.id].concat(all.map(e => e.id)) });
  }"""
if old_scene not in s:
    print('scene pattern not found')
else:
    s = s.replace(old_scene, new_scene)

s = s.replace('0.34\\\\left(t+0.50T\\\\right)', '0.14\\\\left(t+0.14T\\\\right)+0.35')
s = s.replace('0.30\\\\left(t+0.55T\\\\right)', '0.13\\\\left(t+0.15T\\\\right)+0.40')
s = s.replace('0.32\\\\left(t+0.6T\\\\right)', '0.15\\\\left(t+0.15T\\\\right)+0.30')

open(p, 'w', encoding='utf-8').write(s)
print('patched')
