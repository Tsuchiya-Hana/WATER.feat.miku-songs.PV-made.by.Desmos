# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
lines = open(p, encoding='utf-8').read().splitlines()
out = []
for l in lines:
    if "color:'#BFE3EA', lineWidth:'2.0+3.0p'" in l or ("color:'#BFE3EA', lineWidth:'1.0+1.8p'" in l):
        l = l.replace("lineWidth:'1.0+1.8p'", "lineWidth:'2.4+3.2p'").replace("'0.55\\\\left(1-t_{c}", "'0.85\\\\left(1-t_{c}")
    out.append(l)
idx = next(i for i, l in enumerate(out) if "E('E_fade'" in l)
out[idx:idx] = [
 "      E('E_shoutPoint', W('2.2', '0.4'), { color:'#E8FBFF', pointSize:'8+58\\\\left(1-t_{c}\\\\left(112,113.2,T\\\\right)\\\\right)', pointOpacity:cond('T>112', '0.9', '0') }),",
 "      E('E_shoutBeam', Y('y') + '=0.4\\\\left\\\\{' + X('x') + '>2.2\\\\right\\\\}\\\\left\\\\{T>112\\\\right\\\\}', { color:'#BFE3EA', lineWidth:'1.5+3.0p', lineOpacity:cond('T>112', '0.55\\\\left(1-t_{c}\\\\left(112,113.4,T\\\\right)\\\\right)', '0') }),"
]
open(p, 'w', encoding='utf-8').write('\n'.join(out))
print('patched E burst')
