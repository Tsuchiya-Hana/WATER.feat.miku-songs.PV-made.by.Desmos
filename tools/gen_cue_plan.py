# -*- coding: utf-8 -*-
import os, json, re
root = os.path.join(os.path.dirname(__file__), '..')
srt = open(os.path.join(root, '素材', '全部字幕.srt'), encoding='utf-8-sig').read().splitlines()
cues = []
i = 0
def ts(s):
    h, m, rest = s.split(':'); sec, ms = rest.split(',')
    return int(h)*3600 + int(m)*60 + int(sec) + int(ms)/1000
while i < len(srt):
    if srt[i].strip().isdigit() and i+1 < len(srt) and '-->' in srt[i+1]:
        a, b = [x.strip() for x in srt[i+1].split('-->')]
        cues.append((ts(a), ts(b)))
        i += 3
    else:
        i += 1
plan = []
for n, (a, b) in enumerate(cues, 1):
    plan.append({'name': 'L%02d' % n, 't': round((a+b)/2, 3), 'wait': 700})
json.dump(plan, open(os.path.join(root, '_test', 'plan_cues.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(plan))
