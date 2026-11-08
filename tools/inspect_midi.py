# -*- coding: utf-8 -*-
import json, os
from collections import Counter
p = os.path.join(os.path.dirname(__file__), 'midi_events.json')
d = json.load(open(p, encoding='utf-8'))
dr = [n for n in d['notes'] if n['track'] == 2]
print('drums', len(dr), Counter(n['pitch'] for n in dr))
for n in dr[:40]:
    print(n['start'], n['pitch'], n['vel'])
print('--- kicks 35/36 times ---')
print([n['start'] for n in dr if n['pitch'] in (35, 36)][:80])
print('--- snare 38/40 times ---')
print([n['start'] for n in dr if n['pitch'] in (38, 40)][:80])
print('--- bass onsets (pitch <= 43) ---')
ba = [n for n in d['notes'] if n['track'] == 1 and n['pitch'] <= 43]
print(len(ba))
print([(n['start'], n['pitch'], n['vel']) for n in ba[:60]])
print('--- vocals phrase starts ---')
vo = [n for n in d['notes'] if n['track'] == 4]
# group gaps > 0.45
groups=[]
for n in vo:
    if groups and n['start']-groups[-1][-1]['end'] < 0.45:
        groups[-1].append(n)
    else:
        groups.append([n])
print(len(groups))
for g in groups:
    print(round(g[0]['start'],2), round(g[-1]['end'],2), len(g))
