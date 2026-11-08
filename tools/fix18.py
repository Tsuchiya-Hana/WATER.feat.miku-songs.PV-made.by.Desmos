# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
s = open(p, encoding='utf-8').read()
s = s.replace("{ color:'#0B2E3E', fillOpacity:0.22, lineOpacity:0 }", "{ color:'#0B2E3E', fillOpacity:0.32, lineOpacity:0 }")
s = s.replace("{ color:'#0A3A48', fillOpacity:0.16, lineOpacity:0 }", "{ color:'#0A3A48', fillOpacity:0.24, lineOpacity:0 }")
s = s.replace("{ color:'#44E0D0', fillOpacity:0.18, lineOpacity:0 }", "{ color:'#44E0D0', fillOpacity:0.26, lineOpacity:0 }")
s = s.replace("E('C_block', poly(block), { color:'#0B2E3E', fillOpacity:0.40", "E('C_block', poly(block), { color:'#0B2E3E', fillOpacity:0.55")
# insert C core/streak before C_breath
idx = s.find("E('C_breath'")
line_start = s.rfind('\n', 0, idx) + 1
insert = ("      E('C_core', circle(0, 0, '1.00+0.15p'), { color:'#7FE7E4', lineWidth:'2.0+2.0p', lineOpacity:'0.35+0.25p' }),\n"
          "      E('C_flare', W('0', '0'), { color:'#E8FBFF', pointSize:'18+22p', pointOpacity:'0.55+0.2p' }),\n"
          "      E('C_streak', Y('y') + '=0.20+0.45\\\\sin\\\\left(0.65' + X('x') + '-1.8T\\\\right)', { color:'#7FE7E4', lineWidth:'3.0+2.0p', lineOpacity:'0.25+0.20p' }),\n")
s = s[:line_start] + insert + s[line_start:]
open(p, 'w', encoding='utf-8').write(s)
print('patched C focus')
