# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
s = open(p, encoding='utf-8').read()
lines = s.splitlines()
out = []
for l in lines:
    if "E('A_caustic'," in l:
        out.append("      E('A_ray1', X('x') + '=-3.10+0.35\\\\sin\\\\left(0.42' + Y('y') + '+0.18T\\\\right)\\\\left\\\\{' + Y('y') + '<2.32\\\\right\\\\}', { color:'#A8F0E8', lineWidth:'0.8+0.8p', lineOpacity:'0.10+0.06p' }),")
        out.append("      E('A_ray2', X('x') + '=0.55+0.28\\\\sin\\\\left(0.36' + Y('y') + '+0.26T+1.7\\\\right)\\\\left\\\\{' + Y('y') + '<2.32\\\\right\\\\}', { color:'#FFE7BC', lineWidth:'0.6+0.6p', lineOpacity:'0.08+0.05p' }),")
        out.append("      E('A_ray3', X('x') + '=3.85+0.32\\\\sin\\\\left(0.40' + Y('y') + '-0.14T+3.1\\\\right)\\\\left\\\\{' + Y('y') + '<2.32\\\\right\\\\}', { color:'#A8F0E8', lineWidth:'0.7+0.7p', lineOpacity:'0.09+0.05p' }),")
    elif "E('A_dark'," in l:
        out.append("      E('A_thermo1', Y('y') + '<-1.10+0.22\\\\sin\\\\left(0.38' + X('x') + '+0.12T\\\\right)', { color:'#041018', fillOpacity:0.32, lineOpacity:0 }),")
        out.append("      E('A_thermo2', Y('y') + '<-3.05+0.16\\\\sin\\\\left(0.30' + X('x') + '-0.10T\\\\right)', { color:'#01060B', fillOpacity:0.45, lineOpacity:0 }),")
        out.append("      E('A_thermoEdge', Y('y') + '=-1.10+0.22\\\\sin\\\\left(0.38' + X('x') + '+0.12T\\\\right)', { color:'#1E7A8C', lineWidth:0.7, lineOpacity:0.10 }),")
    else:
        out.append(l)
open(p, 'w', encoding='utf-8').write('\n'.join(out))
print('patched A')
