# -*- coding: utf-8 -*-
import os
p = os.path.join(os.path.dirname(__file__), '..', 'src', 'app.js')
lines = open(p, encoding='utf-8').read().splitlines()

def replace_one(anchor, new, occurrence=0):
    seen = 0
    for i, l in enumerate(lines):
        if anchor in l:
            if seen == occurrence:
                lines[i] = new
                return True
            seen += 1
    print('NOT FOUND', anchor)
    return False

replace_one('/* WATER feat. miku', '/* WATER feat. miku — page controller. The visuals are Desmos expressions;')
replace_one("if (bootMsg) bootMsg.textContent", "    if (bootMsg) bootMsg.textContent = 'DESMOS API 加载失败 · 请检查网络后刷新';")
replace_one("if (startNote) startNote.textContent = 'Desmos API", "    if (startNote) startNote.textContent = 'Desmos API 加载失败：仍可播放音频与字幕，请检查网络后刷新。';")
replace_one('const ACCENT =', "  const ACCENT = new Set('ABCDEFG1234TEXT甲乙丙丁输入文本'.split(''));")
replace_one('const TELEMETRY =', "  const TELEMETRY = /^TELEMETRY/;")
replace_one('const words = ja.replace', "      const words = ja.replace(/[（(][^）)]*[）)]/g, '').split(/[\\s　]+/).filter(Boolean);")
replace_one("} else if (/", "    } else if (/　/.test(ja) && (ja.split('　').length >= 3)) {")
replace_one("const words = ja.split('", "      const words = ja.split('　');")
replace_one(".test(ja)) cls += ' breath';", "      if (/BREATH/.test(ja)) cls += ' breath';")
replace_one("if (ch === '", "        if (ch === '（' || ch === '(') {")
replace_one('while (j < ja.length', "          while (j < ja.length && ja[j] !== '）' && ja[j] !== ')') j++;")
replace_one("} else if (ch === ' '", "        } else if (ch === ' ' || ch === '　') {")
replace_one('const breath =', "    const breath = /BREATH/.test(cue.ja);")

# the two plain startNote messages (skip the Desmos API error one)
msg = ["      startNote.textContent = '音频已就绪 · 画面由 Desmos 图表实时演算';",
       "      startNote.textContent = '无法读取 [audio]：可点击 ♪ 选择本地音频，画面仍会播放。';"]
seen = 0
for i, l in enumerate(lines):
    if 'startNote.textContent =' in l and 'Desmos API' not in l:
        if seen < len(msg):
            lines[i] = msg[seen]
            seen += 1

open(p, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print('restored', seen, 'start messages')
