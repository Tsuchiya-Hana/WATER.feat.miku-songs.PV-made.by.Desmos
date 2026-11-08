# -*- coding: utf-8 -*-
"""Sanitize the publication copy: replace lyric/subtitle/score-derived data with generic placeholders.
Run from WATER feat.miku_public/tools/.
"""
import os, re, json

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# ---------------- synthetic cues / pulses
cues = []
for i in range(45):
    start = 2.0 + i * 6.5
    cues.append({
        's': round(start, 3),
        'e': round(start + 5.2, 3),
        'ja': 'ABCDEFG 1234 TEXT 甲乙丙丁 输入文本',
        'zh': ''
    })
impacts = [round(20.0 + i * 1.05 + (i % 5) * 0.03, 3) for i in range(257)]

def replace_assignment(text, name, value):
    pat = re.compile(r'(WATER_DATA\.' + name + r'\s*=\s*)\[.*?\];', re.S)
    new, n = pat.subn(lambda m: m.group(1) + value + ';', text, count=1)
    if n != 1:
        raise RuntimeError('cannot replace WATER_DATA.' + name)
    return new

p = os.path.join(root, 'src', 'data.js')
s = open(p, encoding='utf-8').read()
s = replace_assignment(s, 'CUES', json.dumps(cues, ensure_ascii=False, separators=(',', ':')))
s = replace_assignment(s, 'IMPACTS', json.dumps(impacts, separators=(',', ':')))
open(p, 'w', encoding='utf-8').write(s)

# ---------------- generic section labels in scenes.js
name_map = {
    '夢の海': 'SCENE A', '沈降': 'SCENE B', '急流': 'SCENE C', '水圧': 'SCENE D',
    '暗黒': 'SCENE E', '呼吸': 'SCENE F', '宿命': 'SCENE G', '渦': 'SCENE H',
    '光': 'SCENE I', '記憶': 'SCENE J', '追跡': 'SCENE K', '残響': 'SCENE L', '手': 'SCENE M'
}
en_map = {
    'DREAM SEA': 'PART A', 'DESCENT': 'PART B', 'CURRENT': 'PART C', 'PRESSURE': 'PART D',
    'DARKNESS': 'PART E', 'BREATH': 'PART F', 'FATE': 'PART G', 'VORTEX': 'PART H',
    'LIGHT': 'PART I', 'MEMORY': 'PART J', 'CHASE': 'PART K', 'AFTERGLOW': 'PART L', 'REACH': 'PART M'
}
p = os.path.join(root, 'src', 'scenes.js')
s = open(p, encoding='utf-8').read()
for k, v in name_map.items():
    s = s.replace("name:'" + k + "'", "name:'" + v + "'")
for k, v in en_map.items():
    s = s.replace("en:'" + k + "'", "en:'" + v + "'")
s = re.sub(r'// ===== ([A-M]) / [^\n=]+', r'// ===== \1 / SCENE \1 ', s)
open(p, 'w', encoding='utf-8').write(s)

# ---------------- app.js lyric hooks
p = os.path.join(root, 'src', 'app.js')
s = open(p, encoding='utf-8').read()
s = s.replace(
    "const ACCENT = new Set('夢海光手君名前願沈闇涙約束呼吸底世界叫'.split(''));",
    "const ACCENT = new Set('ABCDEFG1234TEXT甲乙丙丁输入文本'.split(''));"
)
s = s.replace('const TELEMETRY = /^(深度|圧力)/;', 'const TELEMETRY = /^TELEMETRY/;')
s = s.replace('深呼吸', 'BREATH')
s = s.replace("'<div class=\"lyr-meta\">LYRIC '", "'<div class=\"lyr-meta\">TEXT '")
s = s.replace('无法读取 素材/WATER.mp3：可点击 ♪ 选择本地音频，画面仍会播放。',
              '未选择音频：可点击 ♪ 选择本地音频，画面仍会播放。')
open(p, 'w', encoding='utf-8').write(s)

# ---------------- dev.html
p = os.path.join(root, 'dev.html')
s = open(p, encoding='utf-8').read()
s = s.replace('<audio id="audio" src="素材/WATER.mp3" preload="auto"></audio>',
              '<audio id="audio" preload="none"></audio>')
s = s.replace('<div class="line">ただ必死に手を差し伸べた</div>',
              '<div class="line">ABCDEFG 1234 TEXT 甲乙丙丁 输入文本</div>')
s = s.replace('id="hud-section">A / 夢の海<', 'id="hud-section">A / SCENE A<')
s = s.replace('id="sec-jp">夢の海<', 'id="sec-jp">SCENE A<')
s = s.replace('id="sec-en">DREAM SEA<', 'id="sec-en">PART A<')
s = s.replace('A DESMOS GRAPHING CALCULATOR FILM', 'A DESMOS GRAPHING CALCULATOR FILM · PUBLIC DEMO')
s = s.replace('点击进入深海', '点击进入演示')
s = s.replace(
    '<div class="note">HEADPHONES RECOMMENDED · 含轻微闪烁<br><span id="start-note">画面由 Desmos 图表实时演算</span></div>',
    '<div class="note">PUBLIC DEMO · 不含原曲音源<br><span id="start-note">可点击 ♪ 加载你拥有授权的本地音频；无音频时画面按内部时钟演示</span></div>'
)
open(p, 'w', encoding='utf-8').write(s)

# ---------------- gen_data.py: remove the full lyric->translation dictionary
p = os.path.join(root, 'tools', 'gen_data.py')
s = open(p, encoding='utf-8').read()
s2, n = re.subn(r"zh = \{.*?\n\}", "zh = {}  # publication copy: lyric translations removed", s, count=1, flags=re.S)
if n == 1:
    s = s2
else:
    print('WARN: zh dictionary not found in gen_data.py')
open(p, 'w', encoding='utf-8').write(s)

# ---------------- fix_app_encoding.py: remove lyric accent characters
p = os.path.join(root, 'tools', 'fix_app_encoding.py')
if os.path.exists(p):
    s = open(p, encoding='utf-8').read()
    s = s.replace('夢海光手君名前願沈闇涙約束呼吸底世界叫', 'ABCDEFG1234TEXT甲乙丙丁输入文本')
    open(p, 'w', encoding='utf-8').write(s)

print('sanitized:', root)
print('cues', len(cues), 'impacts', len(impacts))
