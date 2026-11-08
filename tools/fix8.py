# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
s = open(p, encoding='utf-8').read()
repls = [
    ("0.14\\\\left(t+0.14T\\\\right)+0.35\\\\cos", "\\\\left(0.14\\\\left(t+0.14T\\\\right)+0.35\\\\right)\\\\cos"),
    ("0.14\\\\left(t+0.14T\\\\right)+0.35\\\\sin", "\\\\left(0.14\\\\left(t+0.14T\\\\right)+0.35\\\\right)\\\\sin"),
    ("0.13\\\\left(t+0.15T\\\\right)+0.40\\\\cos", "\\\\left(0.13\\\\left(t+0.15T\\\\right)+0.40\\\\right)\\\\cos"),
    ("0.13\\\\left(t+0.15T\\\\right)+0.40\\\\sin", "\\\\left(0.13\\\\left(t+0.15T\\\\right)+0.40\\\\right)\\\\sin"),
    ("0.15\\\\left(t+0.15T\\\\right)+0.30\\\\cos", "\\\\left(0.15\\\\left(t+0.15T\\\\right)+0.30\\\\right)\\\\cos"),
    ("0.15\\\\left(t+0.15T\\\\right)+0.30\\\\sin", "\\\\left(0.15\\\\left(t+0.15T\\\\right)+0.30\\\\right)\\\\sin")
]
for a, b in repls:
    s = s.replace(a, b)
open(p, 'w', encoding='utf-8').write(s)
print('patched radii')
