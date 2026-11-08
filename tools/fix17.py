# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
s = open(p, encoding='utf-8').read()
s = s.replace("E('A_sky', Y('y') + '>2.28'", "E('A_sky', Y('y') + '>2.00'")
s = s.replace("E('A_sun', W('0.20', '3.05'), { color:'#FFD9A0'", "E('A_sun', W('0.20', '3.05'), { color:'#F6BE76'")
s = s.replace("pointOpacity:'0.95m(18.8,1,39,0.22,T,19)'", "pointOpacity:'0.90m(18.8,1,39,0.22,T,19)'")
open(p, 'w', encoding='utf-8').write(s)
print('patched A sky/sun')
