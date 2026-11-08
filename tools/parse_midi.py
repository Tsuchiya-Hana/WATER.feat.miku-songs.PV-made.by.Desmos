# -*- coding: utf-8 -*-
"""Minimal SMF parser for WATER.mp3.mid -> JSON event summary."""
import json, struct, sys, os
from collections import Counter, defaultdict

SRC = os.path.join(os.path.dirname(__file__), '..', '素材', 'WATER.mp3.mid')
OUT = os.path.join(os.path.dirname(__file__), 'midi_events.json')

data = open(SRC, 'rb').read()
assert data[:4] == b'MThd'
hlen = struct.unpack('>I', data[4:8])[0]
fmt, ntrk, ppq = struct.unpack('>HHH', data[8:14])
print('format', fmt, 'tracks', ntrk, 'ppq', ppq)
pos = 8 + hlen

def read_vlq(buf, p):
    v = 0
    while True:
        b = buf[p]; p += 1
        v = (v << 7) | (b & 0x7F)
        if not b & 0x80:
            return v, p

tracks = []
for ti in range(ntrk):
    assert data[pos:pos+4] == b'MTrk', (ti, data[pos:pos+4])
    tlen = struct.unpack('>I', data[pos+4:pos+8])[0]
    body = data[pos+8:pos+8+tlen]
    pos += 8 + tlen
    p = 0; tick = 0; running = None
    events = []
    name = ''
    while p < len(body):
        dt, p = read_vlq(body, p)
        tick += dt
        status = body[p]
        if status < 0x80:
            status = running
        else:
            p += 1
            running = status if status < 0xF0 else None
        if status == 0xFF:
            meta = body[p]; p += 1
            ln, p = read_vlq(body, p)
            payload = body[p:p+ln]; p += ln
            if meta == 3:
                name = payload.decode('utf-8', 'replace')
            if meta == 0x51:
                us = int.from_bytes(payload, 'big')
                events.append(('tempo', tick, us))
            if meta == 0x58:
                events.append(('timesig', tick, list(payload)))
            if meta == 0x2F:
                pass
            continue
        if status in (0xF0, 0xF7):
            ln, p = read_vlq(body, p); p += ln
            continue
        kind = status & 0xF0; ch = status & 0x0F
        if kind in (0xC0, 0xD0):
            a = body[p]; p += 1
            events.append(('prog' if kind == 0xC0 else 'chanpress', tick, ch, a))
        else:
            a = body[p]; b = body[p+1]; p += 2
            typ = {0x80:'off',0x90:'on',0xA0:'poly',0xB0:'cc',0xE0:'bend'}.get(kind, hex(kind))
            if typ == 'on' and b == 0:
                typ = 'off'
            events.append((typ, tick, ch, a, b))
    tracks.append({'index': ti, 'name': name, 'events': events})
    print('track', ti, repr(name), 'events', len(events))

# tempo map -> seconds
tempos = []
for t in tracks:
    for ev in t['events']:
        if ev[0] == 'tempo':
            tempos.append((ev[1], ev[2] / 1e6))
tempos.sort()
tempos = [(0, 350058/1e6)] + [x for x in tempos if x[0] > 0]
def tick_to_sec(tick):
    sec = 0.0; last_tick = 0; us = tempos[0][1]
    for tk, us2 in tempos:
        if tk > tick: break
        sec += (tk - last_tick) / ppq * us
        last_tick = tk; us = us2
    return sec + (tick - last_tick) / ppq * us

notes = []
for t in tracks:
    active = {}
    for ev in t['events']:
        if ev[0] == 'on':
            active[(ev[2], ev[3])] = ev[1]
        elif ev[0] == 'off':
            k = (ev[2], ev[3])
            if k in active:
                st = active.pop(k)
                notes.append({
                    'track': t['index'], 'name': t['name'], 'ch': ev[2], 'pitch': ev[3],
                    'start': round(tick_to_sec(st), 3), 'end': round(tick_to_sec(ev[1]), 3),
                    'vel': ev[4],
                })
notes.sort(key=lambda n: (n['start'], n['pitch']))
print('notes', len(notes), 'range', notes[0]['start'], notes[-1]['end'])
print('channels', Counter(n['ch'] for n in notes))
print('pitch hist', Counter(n['pitch'] for n in notes).most_common(12))

# summarize per track: pitch range, notes per 10s
for t in tracks:
    ns = [n for n in notes if n['track'] == t['index']]
    if not ns: continue
    print(f"track {t['index']} {t['name']!r}: n={len(ns)} pitch {min(n['pitch'] for n in ns)}-{max(n['pitch'] for n in ns)} first={ns[0]['start']} last={ns[-1]['end']}")

# Pick low-register loud attacks as impacts; also strong short notes
low = [n for n in notes if n['pitch'] <= 45]
print('low notes', len(low))
# collapse near-simultaneous low attacks
groups = []
for n in sorted(low, key=lambda n: n['start']):
    if groups and n['start'] - groups[-1][0] < 0.06:
        groups[-1][1].append(n)
    else:
        groups.append([n['start'], [n]])
impacts = [{'t': round(g[0], 3), 'p': min(n['pitch'] for n in g[1]), 'v': max(n['vel'] for n in g[1]), 'n': len(g[1])} for g in groups]
print('impact groups', len(impacts))

# section table from production doc
sections = [
    {'name':'A','start':0.0,'end':49.042}, {'name':'B','start':49.042,'end':59.042},
    {'name':'C','start':59.042,'end':69.333}, {'name':'D','start':69.333,'end':92.292},
    {'name':'E','start':92.292,'end':116.25}, {'name':'F','start':116.25,'end':118.417},
    {'name':'G','start':118.417,'end':141.667}, {'name':'H','start':141.667,'end':163.0},
    {'name':'I','start':163.0,'end':187.708}, {'name':'J','start':187.708,'end':211.917},
    {'name':'K','start':211.917,'end':246.917}, {'name':'L','start':246.917,'end':289.958},
    {'name':'M','start':289.958,'end':295.75},
]

json.dump({'ppq':ppq,'tracks':[{'index':t['index'],'name':t['name'],'count':len([n for n in notes if n['track']==t['index']])} for t in tracks],
           'notes':notes,'impacts':impacts,'sections':sections}, open(OUT,'w',encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote', OUT)
