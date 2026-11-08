# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
s = open(p, encoding='utf-8').read()
s = s.replace("D_{x}\\\\left[K\\\\right]' + F(11)", "D_{x}\\\\left[K\\\\right]*' + F(11)")
s = s.replace("D_{y}\\\\left[K\\\\right]' + F(11)", "D_{y}\\\\left[K\\\\right]*' + F(11)")
s = s.replace("D_{z}\\\\left[K\\\\right]' + F(11)", "D_{z}\\\\left[K\\\\right]*' + F(11)")
open(p, 'w', encoding='utf-8').write(s)
print('done')
