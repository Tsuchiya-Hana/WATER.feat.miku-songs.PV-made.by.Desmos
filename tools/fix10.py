# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
lines = open(p, encoding='utf-8').read().splitlines()
out = []
repl = {
 'E_crack1': "      E('E_crack1', poly([['-9.6', '5.7'], ['-2.3', '2.25'], ['-2.8', '1.55'], ['-9.6', '3.9']]), { color:'#0A2A3A', fillOpacity:0.16, lineWidth:0.7, lineOpacity:0.20 }),",
 'E_crack2': "      E('E_crack2', poly([['-9.6', '4.35'], ['-2.2', '2.05'], ['-2.45', '1.72'], ['-9.6', '3.65']]), { color:'#BFE3EA', fillOpacity:0.26, lineWidth:1.0, lineOpacity:0.55 }),",
 'E_beam':  "      E('E_beam', Y('y') + '=0.4+0.03\\\\sin\\\\left(0.3T\\\\right)\\\\left\\\\{-9.6<' + X('x') + '\\\\right\\\\}', { color:'#BFE3EA', lineWidth:'0.5+0.8p', lineOpacity:'0.07+0.06p' }),",
 'E_shout1':"      shout('E_shout1', 0.00, '0.35+7.0t_{c}\\\\left(112,113.4,T\\\\right)'),",
 'E_shout2':"      shout('E_shout2', 0.12, '0.55+8.2t_{c}\\\\left(112.12,113.52,T\\\\right)'),",
 'E_shout3':"      shout('E_shout3', 0.24, '0.75+9.4t_{c}\\\\left(112.24,113.64,T\\\\right)'),",
 'G_ring1': "      E('G_ring1', circle(0, 0, 2.45), { color:c, lineWidth:'1.8+1.4p', lineOpacity:'0.42+0.22p' }),",
 'G_ring2': "      E('G_ring2', circle(0, 0, 2.05), { color:'#1E7A8C', lineWidth:0.9, lineOpacity:0.28 }),",
 'G_ticks': "      E('G_ticks', W('2.28\\\\cos\\\\left(0.2618i\\\\right)', '2.28\\\\sin\\\\left(0.2618i\\\\right)') + '\\\\operatorname{for}i=\\\\left[1...48\\\\right]', { color:'#7FD8E8', pointSize:'2.2+2.2p', pointOpacity:0.75 }),",
 'I_shaft1':"      E('I_shaft1', poly([['1.6', '5.8'], ['4.4', '5.8'], ['1.2', '-2.6'], ['0.2', '-2.4']]), { color:'#FFD9A0', fillOpacity:'0.10+0.05p', lineOpacity:0 }),",
 'I_shaft2':"      E('I_shaft2', poly([['2.4', '5.8'], ['3.5', '5.8'], ['1.35', '-1.8'], ['0.85', '-1.7']]), { color:'#FFE7BC', fillOpacity:'0.14+0.06p', lineOpacity:0 }),",
 'I_shaft3':"      E('I_shaft3', poly([['2.85', '5.8'], ['3.15', '5.8'], ['1.45', '-1.2'], ['1.25', '-1.2']]), { color:'#FFF0D0', fillOpacity:0.20, lineOpacity:0 }),",
 'I_crack': "      E('I_crack', poly([['-9.8', '2.02'], ['4.8', '1.34'], ['4.8', '1.24'], ['-9.8', '1.72']]), { color:'#FFD9A0', fillOpacity:'0.16+0.06p', lineWidth:'0.8+1.2p', lineOpacity:'0.55+0.25p' }),",
 'K_band1': "      E('K_band1', '\\\\sin\\\\left(1.8\\\\left(' + X('x') + '\\\\cos\\\\left(0.4\\\\right)+' + Y('y') + '\\\\sin\\\\left(0.4\\\\right)\\\\right)-3.0T\\\\right)>0.72', { color:'#0B2E3E', fillOpacity:0.30, lineOpacity:0 }),",
 'K_band2': "      E('K_band2', '\\\\left|\\\\sin\\\\left(4.2\\\\left(' + X('x') + '\\\\cos\\\\left(-0.3\\\\right)+' + Y('y') + '\\\\sin\\\\left(-0.3\\\\right)\\\\right)-5.0T\\\\right)\\\\right|<0.008', { color:'#44E0D0', fillOpacity:0.24, lineOpacity:0 }),",
 'L_heart': "      E('L_heart', W('0', '0.15'), { color:'#FFCF9A', pointSize:'30+26p', pointOpacity:'0.70+0.25p' }),",
 'L_glow1': "      E('L_glow1', circle(0, 0.15, '1.35+0.35p'), { color:'#FFCF9A', fillOpacity:0.05, lineWidth:0.9, lineOpacity:'0.18+0.12p' }),",
 'L_glow2': "      E('L_glow2', circle(0, 0.15, '3.0+0.7p'), { color:'#FFCF9A', fillOpacity:0.025, lineWidth:0.7, lineOpacity:'0.10+0.08p' }),",
 'M_star':  "      E('M_star', W('4.4', '1.0'), { color:'#FFF0D0', pointSize:'20+18p', pointOpacity:'0.85+0.15p' }),",
 'M_glow':  "      E('M_glow', circle(4.4, 1.0, '1.6+0.3p'), { color:'#FFD9A0', fillOpacity:0.055, lineWidth:1.0, lineOpacity:0.28 }),",
}
for l in lines:
    hit = False
    for k, v in repl.items():
        if "E('" + k + "'," in l:
            out.append(v); hit = True; break
    if hit:
        continue
    out.append(l)

# insert E point + glow before E_fade
idx = next(i for i, l in enumerate(out) if "E('E_fade'" in l)
out[idx:idx] = [
 "      E('E_point', W('2.2', '0.4'), { color:'#E8FBFF', pointSize:'12+22p', pointOpacity:cond('T>111.9', '0.9', '0') }),",
 "      E('E_glow', ellipseAt(2.2, 0.4, 4.4, 3.2), { color:'#BFE3EA', fillOpacity:cond('T>111.5', '0.055', '0'), lineOpacity:0 }),"
]

# insert B ribbon + arc before B_light
idx = next(i for i, l in enumerate(out) if "E('B_light'" in l)
out[idx:idx] = [
 "      E('B_ribbon', W('\\\\left(0.14\\\\left(t+0.14T\\\\right)+0.35\\\\right)\\\\cos\\\\left(t+0.22T+0.8\\\\right)', '0.18+0.66\\\\left(0.14\\\\left(t+0.14T\\\\right)+0.35\\\\right)\\\\sin\\\\left(t+0.22T+0.8\\\\right)'), { color:'#7FE7E4', lineWidth:'3.0+2.0p', lineOpacity:'0.26+0.18p', parametricDomain:{min:'0',max:'20'} }),",
 "      E('B_arc', circle(0, 0.18, '2.4+0.15p'), { color:'#7FE7E4', lineWidth:'1.5+1.5p', lineOpacity:'0.22+0.18p' }),"
]

# add warm glow around chase point before K_drop
idx = next(i for i, l in enumerate(out) if "E('K_drop'" in l)
out[idx:idx] = [
 "      E('K_chaseGlow', circle(0, 0, '1.65+0.3p'), { color:'#FFCF9A', fillOpacity:0.035, lineWidth:0.8, lineOpacity:'0.15+0.10p' }),"
]

open(p, 'w', encoding='utf-8').write('\n'.join(out))
print('patched E/G/I/K/L/M + B ribbon')
