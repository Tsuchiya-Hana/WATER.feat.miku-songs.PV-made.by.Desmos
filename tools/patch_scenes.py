# -*- coding: utf-8 -*-
import re, os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
s = open(p, encoding='utf-8').read()

# 1. rename transform functions X/Y -> g_x/g_y (X and Y collide with Desmos point vars)
s = s.replace("const X = e => 'X\\\\left(' + e + '\\\\right)';", "const X = e => 'g_{x}\\\\left(' + e + '\\\\right)';")
s = s.replace("const Y = e => 'Y\\\\left(' + e + '\\\\right)';", "const Y = e => 'g_{y}\\\\left(' + e + '\\\\right)';")
s = s.replace("E('X', 'X(x)=c_{z}\\\\left(x-c_{x}\\\\right)', { hidden: true }),", "E('gx', 'g_{x}(x)=c_{z}\\\\left(x-c_{x}\\\\right)', { hidden: true }),")
s = s.replace("E('Y', 'Y(y)=c_{z}\\\\left(y-c_{y}\\\\right)', { hidden: true })", "E('gy', 'g_{y}(y)=c_{z}\\\\left(y-c_{y}\\\\right)', { hidden: true })")

# 2. f_l was missing the outer right brace
s = s.replace("\\\\right]\\\\operatorname{with}", "\\\\right]\\\\right\\\\}\\\\operatorname{with}")

# 3. camera expressions need explicit multiplication
s = s.replace("D_{x}\\\\left[K\\\\right]f_{l}", "D_{x}\\\\left[K\\\\right]*f_{l}")
s = s.replace("D_{y}\\\\left[K\\\\right]f_{l}", "D_{y}\\\\left[K\\\\right]*f_{l}")
s = s.replace("D_{z}\\\\left[K\\\\right]f_{l}", "D_{z}\\\\left[K\\\\right]*f_{l}")

# 4. number immediately followed by m(...) needs a *
s = re.sub(r'([0-9.])m\(', r'\1*m(', s)

# 5. K trails: remove bogus third W argument
s = s.replace(", '0'), { color:'#FFCF9A'", "), { color:'#FFCF9A'")

# 6. I_star: build from W so camera transform applies
old_star = [l for l in s.splitlines() if "E('I_star'," in l]
if old_star:
    new_star = ("      E('I_star', '\\\\operatorname{polygon}\\\\left(\\\\left(' + W('0.45\\\\left(1-0.62\\\\operatorname{mod}\\\\left(i,2\\\\right)\\\\right)\\\\cos\\\\left(1.5708i+0.7854\\\\right)+' + ex, "
                "'0.45\\\\left(1-0.62\\\\operatorname{mod}\\\\left(i,2\\\\right)\\\\right)\\\\sin\\\\left(1.5708i+0.7854\\\\right)+' + ey) + '\\\\right)\\\\operatorname{for}i=\\\\left[1...8\\\\right]\\\\right)', "
                "{ color:'#FFF0D0', fillOpacity:0.35, lineWidth:1.0, lineOpacity:0.75 }),")
    s = s.replace(old_star[0], new_star)

open(p, 'w', encoding='utf-8').write(s)
print('patched')
