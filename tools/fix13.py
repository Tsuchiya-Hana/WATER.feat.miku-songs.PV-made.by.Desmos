# -*- coding: utf-8 -*-
import os
base = os.path.join(os.path.dirname(__file__), '..', 'src')
p = os.path.join(base, 'scenes.js')
s = open(p, encoding='utf-8').read()
s = s.replace("2.44-0.192", "1.88-0.2417")
s = s.replace("lineWidth:'0.6+0.9p', lineOpacity:op", "lineWidth:'1.2+1.4p', lineOpacity:op")
open(p, 'w', encoding='utf-8').write(s)

p = os.path.join(base, 'app.js')
s = open(p, encoding='utf-8').read()
old = "    if (cueEl) {\n      cueEl.style.opacity = 1;"
new = "    if (cueEl) {\n      cueEl.style.opacity = 1;\n      cueEl.style.transform = 'scale(' + (1 + 0.012 * Math.min(1.6, pulseAt(T))).toFixed(4) + ')';"
if old in s:
    s = s.replace(old, new)
else:
    print('cueEl block not found')
open(p, 'w', encoding='utf-8').write(s)
print('patched')
