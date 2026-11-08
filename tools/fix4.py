# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
s = open(p, encoding='utf-8').read()
s = s.replace("const X = e => 'g_{x}\\\\left(' + e + '\\\\right)';",
              "const X = e => 'c_{z}\\\\left(' + e + '-c_{x}\\\\right)';")
s = s.replace("const Y = e => 'g_{y}\\\\left(' + e + '\\\\right)';",
              "const Y = e => 'c_{z}\\\\left(' + e + '-c_{y}\\\\right)';")
# remove the two function definition expressions
lines = s.splitlines()
out = []
for l in lines:
    if "E('gx', 'g_{x}(x)=c_{z}" in l or "E('gy', 'g_{y}(y)=c_{z}" in l:
        continue
    out.append(l)
s = '\n'.join(out)
open(p, 'w', encoding='utf-8').write(s)
print('patched')
