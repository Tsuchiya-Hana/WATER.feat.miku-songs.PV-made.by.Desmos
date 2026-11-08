# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
s = open(p, encoding='utf-8').read()
s = s.replace("E('K_chaseGlow', circle(0, 0, '1.65+0.3p')", "E('K_chaseGlow', circle(pathX, pathY, '1.65+0.3p')")
open(p, 'w', encoding='utf-8').write(s)
print('patched K glow')
