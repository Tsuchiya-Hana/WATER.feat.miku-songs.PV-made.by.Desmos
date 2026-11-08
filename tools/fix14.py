# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
s = open(p, encoding='utf-8').read()
s = s.replace("E('A_thermo1', Y('y') + '<-1.10+0.22\\\\sin\\\\left(0.38' + X('x') + '+0.12T\\\\right)', { color:'#041018', fillOpacity:0.32, lineOpacity:0 })",
              "E('A_thermo1', Y('y') + '<-1.10+0.22\\\\sin\\\\left(0.38' + X('x') + '+0.12T\\\\right)', { color:'#041018', fillOpacity:0.16, lineOpacity:0 })")
s = s.replace("E('A_thermo2', Y('y') + '<-3.05+0.16\\\\sin\\\\left(0.30' + X('x') + '-0.10T\\\\right)', { color:'#01060B', fillOpacity:0.45, lineOpacity:0 })",
              "E('A_thermo2', Y('y') + '<-3.05+0.16\\\\sin\\\\left(0.30' + X('x') + '-0.10T\\\\right)', { color:'#020B12', fillOpacity:0.25, lineOpacity:0 })")
s = s.replace("lineWidth:0.7, lineOpacity:0.10 }),", "lineWidth:0.8, lineOpacity:0.16 }),")

# extra J memory shards + dust before J_line
idx = next(i for i, l in enumerate(s.splitlines()) if "E('J_line'" in l)
lines = s.splitlines()
lines[idx:idx] = [
 "      shard('J_sh4', 0.6, 1.15, 0.55), shard('J_sh5', -3.0, -0.35, 0.70), shard('J_sh6', 2.2, -0.9, 0.48),",
 "      E('J_dust', W('\\\\operatorname{mod}\\\\left(6.7i,19\\\\right)-9.5', '\\\\operatorname{mod}\\\\left(0.21i+0.03T,11\\\\right)-5.5') + '\\\\operatorname{for}i=\\\\left[1...42\\\\right]', { color:'#9EDCE8', pointSize:'1.2+1.4p', pointOpacity:0.34 }),"
]
s = '\n'.join(lines)

# E slow outer ring before E_fade
idx = next(i for i, l in enumerate(s.splitlines()) if "E('E_fade'" in l)
lines = s.splitlines()
lines[idx:idx] = ["      E('E_voidRing', circle(2.2, 0.4, 4.6), { color:'#BFE3EA', lineWidth:'0.6+0.8p', lineOpacity:'0.10+0.08p' }),"]
s = '\n'.join(lines)
open(p, 'w', encoding='utf-8').write(s)

p = os.path.join(os.path.dirname(__file__), '..', 'src', 'app.js')
s = open(p, encoding='utf-8').read()
s = s.replace("    G: { x: '50%', y: '50%', c: '#2AA7B8', a: 0.23 },", "    G: { x: '62%', y: '50%', c: '#FF5A6E', a: 0.14 },")
old = "    } else {\n      if (/深呼吸/.test(ja)) cls += ' breath';"
new = "    } else {\n      if (/深呼吸/.test(ja)) cls += ' breath';\n      if ((cue.s >= 59.042 && cue.s < 69.333) || (cue.s >= 118.417 && cue.s < 141.667) || (cue.s >= 211.917 && cue.s < 246.917)) cls += ' chorus';"
if old in s:
    s = s.replace(old, new)
else:
    print('chorus insert point not found')
open(p, 'w', encoding='utf-8').write(s)
print('patched')
