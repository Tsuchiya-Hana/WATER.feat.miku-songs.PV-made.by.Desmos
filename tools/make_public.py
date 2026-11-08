# -*- coding: utf-8 -*-
"""Create a sanitized publication copy of the WATER MV (no song assets/lyrics/subtitles/score)."""
import os, re, json, shutil

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
src_html = os.path.join(root, 'index.html')
pub_dir = os.path.join(os.path.dirname(root), 'WATER feat.miku_public')
os.makedirs(pub_dir, exist_ok=True)

html = open(src_html, encoding='utf-8').read()

# ---------------- synthetic placeholder subtitle cues (no original SRT timing/text)
cues = []
for i in range(45):
    start = 2.0 + i * 6.5
    end = start + 5.2
    cues.append({
        's': round(start, 3),
        'e': round(end, 3),
        'ja': 'ABCDEFG 1234 TEXT 甲乙丙丁 输入文本',
        'zh': ''
    })
cues_json = json.dumps(cues, ensure_ascii=False, separators=(',', ':'))

# ---------------- synthetic pulse list (no MIDI-derived timing), same length 257 to keep p formula
impacts = [round(20.0 + i * 1.05 + (i % 5) * 0.03, 3) for i in range(257)]
impacts_json = json.dumps(impacts, separators=(',', ':'))

def replace_assignment(text, name, value):
    pat = re.compile(r'(WATER_DATA\.' + name + r'\s*=\s*)\[.*?\];', re.S)
    new, n = pat.subn(lambda m: m.group(1) + value + ';', text, count=1)
    if n != 1:
        raise RuntimeError('cannot replace WATER_DATA.' + name)
    return new

html = replace_assignment(html, 'CUES', cues_json)
html = replace_assignment(html, 'IMPACTS', impacts_json)

# ---------------- generic section labels (remove Japanese scene names)
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
for k, v in name_map.items():
    html = html.replace("name:'" + k + "'", "name:'" + v + "'")
    html = html.replace('id="sec-jp">' + k + '<', 'id="sec-jp">' + v + '<')
for k, v in en_map.items():
    html = html.replace("en:'" + k + "'", "en:'" + v + "'")
    html = html.replace('id="sec-en">' + k + '<', 'id="sec-en">' + v + '<')

# HUD / section card defaults
html = html.replace('id="hud-section">A / 夢の海<', 'id="hud-section">A / SCENE A<')
html = html.replace('id="sec-jp">夢の海<', 'id="sec-jp">SCENE A<')
html = html.replace('id="sec-en">DREAM SEA<', 'id="sec-en">PART A<')

# ---------------- remove remaining lyric-character hooks
html = html.replace(
    "const ACCENT = new Set('夢海光手君名前願沈闇涙約束呼吸底世界叫'.split(''));",
    "const ACCENT = new Set('ABCDEFG1234TEXT甲乙丙丁输入文本'.split(''));"
)
html = html.replace('const TELEMETRY = /^(深度|圧力)/;', 'const TELEMETRY = /^TELEMETRY/;')
html = html.replace('深呼吸', 'BREATH')  # only code hooks remain after CUES replacement

# remove Japanese section labels from code comments too
html = re.sub(r'// ===== ([A-M]) / [^\n=]+', r'// ===== \1 / SCENE \1 ', html)

# ---------------- end card / subtitle meta
html = html.replace('<div class="line">ただ必死に手を差し伸べた</div>',
                    '<div class="line">ABCDEFG 1234 TEXT 甲乙丙丁 输入文本</div>')
html = html.replace("'<div class=\"lyr-meta\">LYRIC '", "'<div class=\"lyr-meta\">TEXT '")
html = html.replace("LYRIC ' + String", "TEXT ' + String")

# ---------------- audio: no bundled source; user can load their own
html = html.replace('<audio id="audio" src="素材/WATER.mp3" preload="auto"></audio>',
                    '<audio id="audio" preload="none"></audio>')
html = html.replace('无法读取 素材/WATER.mp3：可点击 ♪ 选择本地音频，画面仍会播放。',
                    '未选择音频：可点击 ♪ 选择本地音频，画面仍会播放。')

# ---------------- start screen wording
html = html.replace('A DESMOS GRAPHING CALCULATOR FILM',
                    'A DESMOS GRAPHING CALCULATOR FILM · PUBLIC DEMO')
html = html.replace('点击进入深海', '点击进入演示')
html = html.replace(
    '<div class="note">HEADPHONES RECOMMENDED · 含轻微闪烁<br><span id="start-note">画面由 Desmos 图表实时演算</span></div>',
    '<div class="note">PUBLIC DEMO · 不含原曲音源<br><span id="start-note">可点击 ♪ 加载你拥有授权的本地音频；无音频时画面按内部时钟演示</span></div>'
)

# ---------------- write
out_html = os.path.join(pub_dir, 'index.html')
open(out_html, 'w', encoding='utf-8').write(html)

# ---------------- audit
def count(pattern):
    return len(re.findall(pattern, html))

report = {
    'public_dir': pub_dir,
    'index_size': len(html),
    'cues': len(cues),
    'impacts': len(impacts),
    'cues_original_lyric_chars': count(r'夢|君|涙|約束|深呼吸|孤独|宿命|圧力|深度|乱流|酸素|欠乏|窒息|目眩|叫|願|光|海|沈|闇|底|手を差し伸べ|ただ必死'),
    'source_mentions': count(r'素材/WATER\.mp3|WATER\.mp3|全部字幕|所有歌词|曲绘|WATER\.mp3\.mid'),
}
print(json.dumps(report, ensure_ascii=False, indent=1))
