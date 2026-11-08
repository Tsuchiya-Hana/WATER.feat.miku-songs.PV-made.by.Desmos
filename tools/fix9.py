# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'scenes.js')
s = open(p, encoding='utf-8').read()

old = """    const wash = E('s' + id + '_wash', 'y<100', { color: sec.color, fillOpacity: 0.030, lineOpacity: 0, hidden: id !== 1 });
    const fog1 = E('s' + id + '_fog1', ellipseAt(0, 0, 9, 6), { color: sec.color, fillOpacity: 0.050, lineOpacity: 0, hidden: id !== 1 });
    const fog2 = E('s' + id + '_fog2', ellipseAt(0, 0, 5.2, 3.5), { color: sec.color, fillOpacity: 0.075, lineOpacity: 0, hidden: id !== 1 });
    const all = [wash, fog1, fog2].concat(layers);"""
new = """    const wash = E('s' + id + '_wash', 'y<100', { color: sec.color, fillOpacity: 0.018, lineOpacity: 0, hidden: id !== 1 });
    const all = [wash].concat(layers);"""
if old not in s:
    print('fog block not found')
else:
    s = s.replace(old, new)

repl = {
    "'0.16+0.14p'": "'0.30+0.20p'",
    "'0.12+0.12p'": "'0.22+0.16p'",
    "'0.14+0.12p'": "'0.28+0.18p'",
    "'0.10+0.10p'": "'0.20+0.14p'",
    "'0.09+0.10p'": "'0.18+0.14p'",
    "lineOpacity:0.11, parametricDomain:{min:'0',max:'22'}": "lineOpacity:0.18, parametricDomain:{min:'0',max:'22'}",
    "lineOpacity:0.08, parametricDomain:{min:'0',max:'26'}": "lineOpacity:0.16, parametricDomain:{min:'0',max:'26'}",
    "{ color:'#1E7A8C', fillOpacity:0.10, lineOpacity:0 }": "{ color:'#1E7A8C', fillOpacity:0.17, lineOpacity:0 }",
    "{ color:'#1E7A8C', fillOpacity:0.07, lineOpacity:0 }": "{ color:'#1E7A8C', fillOpacity:0.11, lineOpacity:0 }",
    "pointSize:2.0, pointOpacity:0.32": "pointSize:2.4, pointOpacity:0.52",
    "pointSize:1.8, pointOpacity:0.34": "pointSize:2.0, pointOpacity:0.48",
    "pointSize:2.0, pointOpacity:0.38": "pointSize:2.4, pointOpacity:0.55",
    "lineOpacity:'0.18+0.16p'": "lineOpacity:'0.30+0.20p'",
    "lineOpacity:0.16 }": "lineOpacity:0.26 }",
    "pointSize:'1.2+1.2p', pointOpacity:0.38": "pointSize:'1.5+1.5p', pointOpacity:0.62",
    "pointSize:'1.4+1.4p', pointOpacity:0.28": "pointSize:'1.8+1.8p', pointOpacity:0.42",
    "lineOpacity:'0.20+0.20p'": "lineOpacity:'0.30+0.25p'",
    "lineOpacity:cond('T>118.417', '0.26+0.12p', '0')": "lineOpacity:cond('T>118.417', '0.40+0.15p', '0')",
    "fillOpacity:'0.035+0.02p'": "fillOpacity:'0.07+0.03p'",
    "fillOpacity:'0.05+0.03p'": "fillOpacity:'0.09+0.04p'",
    "fillOpacity:0.06, lineWidth:0.9, lineOpacity:0.5": "fillOpacity:0.12, lineWidth:1.2, lineOpacity:0.68",
    "fillOpacity:0.04, lineOpacity:0 }": "fillOpacity:0.08, lineOpacity:0 }",
    "fillOpacity:0.035, lineOpacity:0 }": "fillOpacity:0.07, lineOpacity:0 }",
    "fillOpacity:0.045, lineOpacity:0 }": "fillOpacity:0.09, lineOpacity:0 }",
    "{ color:'#0B2E3E', fillOpacity:0.20, lineOpacity:0 }": "{ color:'#0B2E3E', fillOpacity:0.28, lineOpacity:0 }",
    "fillOpacity:0.15, lineOpacity:0 }": "fillOpacity:0.22, lineOpacity:0 }",
}
for a, b in repl.items():
    s = s.replace(a, b)

open(p, 'w', encoding='utf-8').write(s)
print('patched scene fog removal / opacity')
