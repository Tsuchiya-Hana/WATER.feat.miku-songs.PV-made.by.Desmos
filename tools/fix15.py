# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
s = open(p, encoding='utf-8').read()
s = s.replace("pointSize:'1.8+2.2p', pointOpacity:0.42", "pointSize:'2.4+2.6p', pointOpacity:0.50")
s = s.replace("pointSize:'3.2+3p', pointOpacity:0.26", "pointSize:'4.0+3.5p', pointOpacity:0.34")
idx = s.find("E('g_scan'")
end = s.find('\n', s.find('lineOpacity:0 })', idx))
line = "\n    E('g_horizon', Y('y') + '=-4.55+0.12\\\\sin\\\\left(0.35' + X('x') + '+0.20T\\\\right)', { color:'#2AA7B8', lineWidth:'0.7+0.6p', lineOpacity:'0.10+0.05p' }),"
s = s[:end+1] + line + s[end+1:]
open(p, 'w', encoding='utf-8').write(s)
print('patched dust/horizon')
