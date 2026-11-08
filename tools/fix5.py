# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
s = open(p, encoding='utf-8').read()
old = "const ellipse = (id, r, op) => E(id, '\\\\left(' + X('x') + '/' + r + '\\\\right)^{2}+\\\\left(' + Y('y') + '/' + (r * 0.62).toFixed(3) + '\\\\right)^{2}=1', { color:c, lineWidth:'0.6+0.9p', lineOpacity:op });"
new = "const ellipse = (id, r, op) => E(id, '\\\\left(' + X('x') + '/\\\\left(' + r + '\\\\right)\\\\right)^{2}+\\\\left(' + Y('y') + '/\\\\left(0.62\\\\left(' + r + '\\\\right)\\\\right)\\\\right)^{2}=1', { color:c, lineWidth:'0.6+0.9p', lineOpacity:op });"
if old not in s:
    print('ellipse pattern not found; showing nearby lines')
    for l in s.splitlines():
        if 'const ellipse' in l: print(repr(l))
else:
    s = s.replace(old, new)
    open(p, 'w', encoding='utf-8').write(s)
    print('patched ellipse')
