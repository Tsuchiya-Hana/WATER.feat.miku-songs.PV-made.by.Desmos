# -*- coding: utf-8 -*-
"""Audit the publication copy for remaining lyric/asset references and placeholder data."""
import io, re, json, os

root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
p = os.path.join(root, 'index.html')
s = io.open(p, encoding='utf-8').read()

cues = json.loads(re.search(r'WATER_DATA\.CUES = (\[.*?\]);', s, re.S).group(1))
impacts = json.loads(re.search(r'WATER_DATA\.IMPACTS = (\[.*?\]);', s, re.S).group(1))

report = {
    'cues': len(cues),
    'first_cue': cues[0],
    'last_cue': cues[-1],
    'impacts': len(impacts),
    'first_impact': impacts[0],
    'last_impact': impacts[-1],
    'audio_with_asset_src': bool(re.search(r'<audio[^>]+src="[^"]*素材', s)),
    'kana_index': len(re.findall(r'[\u3040-\u30ff]', s)),
    'asset_refs_index': len(re.findall(r'WATER\.mp3|素材/|全部字幕|所有歌词|曲绘|\.mid', s)),
    'placeholder_count': s.count('ABCDEFG 1234 TEXT 甲乙丙丁 输入文本'),
}
print(json.dumps(report, ensure_ascii=False, indent=1))
