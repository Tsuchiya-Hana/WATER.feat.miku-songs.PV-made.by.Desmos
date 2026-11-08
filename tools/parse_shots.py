# -*- coding: utf-8 -*-
"""Extract the 104-shot storyboard table into JSON."""
import json, os, re

src = os.path.join(os.path.dirname(__file__), '..', '理解性任务', '歌曲PV制作表.md')
out = os.path.join(os.path.dirname(__file__), 'shots.json')
lines = open(src, encoding='utf-8').read().splitlines()

shots = []
for line in lines:
    if not line.startswith('|'):
        continue
    cells = [c.strip() for c in line.strip().strip('|').split('|')]
    if len(cells) < 9:
        continue
    if not re.fullmatch(r'\d+', cells[0]):
        continue
    no = int(cells[0])
    m = re.match(r'([\d.]+)[–-]([\d.]+)', cells[1])
    if not m:
        continue
    start, end = float(m.group(1)), float(m.group(2))
    shots.append({
        'no': no, 'start': start, 'end': end, 'dur': round(end-start, 3),
        'lyric': cells[3], 'emotion': cells[4], 'layers': cells[5],
        'camera': cells[6], 'actions': cells[7], 'expr': cells[8],
    })

print('shots', len(shots), 'first', shots[0]['no'], 'last', shots[-1]['no'])
missing = [n for n in range(1, 105) if n not in {s['no'] for s in shots}]
print('missing', missing)
json.dump(shots, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote', out)
for s in shots[:5]:
    print(s['no'], s['start'], s['end'], s['camera'][:50])
