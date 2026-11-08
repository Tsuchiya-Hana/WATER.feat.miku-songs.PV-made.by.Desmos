# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
lines = open(p, encoding='utf-8').read().splitlines()
out = []
repl = {
 'cx': "    E('cx', 'c_{x}=L_{x}\\\\left[K\\\\right]+D_{x}\\\\left[K\\\\right]*' + F(11) + '+0.012p\\\\sin\\\\left(7T\\\\right)', { hidden: true }),",
 'cy': "    E('cy', 'c_{y}=L_{y}\\\\left[K\\\\right]+D_{y}\\\\left[K\\\\right]*' + F(11) + '+0.008p\\\\cos\\\\left(9T\\\\right)', { hidden: true }),",
 'cz': "    E('cz', 'c_{z}=L_{z}\\\\left[K\\\\right]+D_{z}\\\\left[K\\\\right]*' + F(11) + '+0.022p', { hidden: true }),",
 'g_ring': "    E('g_ring', circle(0, 0, '4.2+0.45p'), { color:'#44E0D0', lineWidth:'1.0+2.4p', lineOpacity:'0.06+0.20p' })",
 'E_crack1': "      E('E_crack1', poly([['-9.6', '5.7'], ['-2.35', '2.55'], ['-2.62', '2.28'], ['-9.6', '4.15']]), { color:'#0A2A3A', fillOpacity:0.10, lineWidth:0.6, lineOpacity:0.18 }),",
 'E_crack2': "      E('E_crack2', poly([['-9.6', '4.20'], ['-2.36', '2.45'], ['-2.48', '2.32'], ['-9.6', '3.80']]), { color:'#BFE3EA', fillOpacity:0.16, lineWidth:0.8, lineOpacity:0.35 }),",
 'I_crack': "      E('I_crack', poly([['-9.8', '1.66'], ['4.8', '1.40'], ['4.8', '1.36'], ['-9.8', '1.56']]), { color:'#FFF0D0', fillOpacity:'0.22+0.08p', lineWidth:'0.6+0.8p', lineOpacity:'0.55+0.25p' }),",
 'I_starGlow': "      E('I_starGlow', circle(ex, ey, '1.4+0.12p'), { color:'#FFD9A0', fillOpacity:0, lineWidth:1.1, lineOpacity:'0.20+0.10p' }),",
 'B_v1': "      E('B_v1', W('0.14\\\\left(t+0.14T\\\\right)+0.35\\\\cos\\\\left(t+0.22T\\\\right)', '0.18+0.66\\\\left(0.14\\\\left(t+0.14T\\\\right)+0.35\\\\right)\\\\sin\\\\left(t+0.22T\\\\right)'), { color:'#2AA7B8', lineWidth:2.2, lineOpacity:'0.34+0.18p', parametricDomain:{min:'0',max:'22'} }),",
 'B_v2': "      E('B_v2', W('0.14\\\\left(t+0.14T\\\\right)+0.35\\\\cos\\\\left(t+0.22T+2.1\\\\right)', '0.18+0.66\\\\left(0.14\\\\left(t+0.14T\\\\right)+0.35\\\\right)\\\\sin\\\\left(t+0.22T+2.1\\\\right)'), { color:'#44E0D0', lineWidth:1.7, lineOpacity:'0.26+0.16p', parametricDomain:{min:'0',max:'22'} }),",
 'B_v3': "      E('B_v3', W('0.14\\\\left(t+0.14T\\\\right)+0.35\\\\cos\\\\left(t+0.22T+4.2\\\\right)', '0.18+0.66\\\\left(0.14\\\\left(t+0.14T\\\\right)+0.35\\\\right)\\\\sin\\\\left(t+0.22T+4.2\\\\right)'), { color:'#2AA7B8', lineWidth:1.2, lineOpacity:0.20, parametricDomain:{min:'0',max:'22'} }),",
 'B_ribbon': "      E('B_ribbon', W('\\\\left(0.14\\\\left(t+0.14T\\\\right)+0.35\\\\right)\\\\cos\\\\left(t+0.22T+0.8\\\\right)', '0.18+0.66\\\\left(0.14\\\\left(t+0.14T\\\\right)+0.35\\\\right)\\\\sin\\\\left(t+0.22T+0.8\\\\right)'), { color:'#7FE7E4', lineWidth:'5.0+2.0p', lineOpacity:'0.38+0.20p', parametricDomain:{min:'0',max:'20'} }),",
}
for l in lines:
    hit = False
    for k, v in repl.items():
        if "E('" + k + "'," in l:
            out.append(v); hit = True; break
    if hit:
        continue
    if "E('E_glow'," in l:
        continue
    out.append(l)

# add a bright core line to the E crack
idx = next(i for i, l in enumerate(out) if "E('E_beam'" in l)
out[idx:idx] = ["      E('E_crackCore', Y('y') + '=2.44-0.192' + X('x') + '\\\\left\\\\{' + X('x') + '<-2.3\\\\right\\\\}', { color:'#E8FBFF', lineWidth:'1.0+2.0p', lineOpacity:'0.55+0.25p' }),"]

# add a gauge needle before G_pulse
idx = next(i for i, l in enumerate(out) if "E('G_pulse'" in l)
out[idx:idx] = ["      E('G_needle', W('2.05t\\\\cos\\\\left(0.5+0.02\\\\left(T-118.417\\\\right)\\\\right)', '2.05t\\\\sin\\\\left(0.5+0.02\\\\left(T-118.417\\\\right)\\\\right)'), { color:'#FFE7BC', lineWidth:'1.4+1.0p', lineOpacity:'0.55+0.20p', parametricDomain:{min:'0',max:'1'} })," ]

open(p, 'w', encoding='utf-8').write('\n'.join(out))
print('patched camera pulse, cracks, gauge, vortex')
