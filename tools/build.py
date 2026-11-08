# -*- coding: utf-8 -*-
"""Inline src/*.js and src/style.css into a single deliverable index.html."""
import os
root = os.path.join(os.path.dirname(__file__), '..')
dev = open(os.path.join(root, 'dev.html'), encoding='utf-8').read()
css = open(os.path.join(root, 'src', 'style.css'), encoding='utf-8').read()
data = open(os.path.join(root, 'src', 'data.js'), encoding='utf-8').read()
scenes = open(os.path.join(root, 'src', 'scenes.js'), encoding='utf-8').read()
app = open(os.path.join(root, 'src', 'app.js'), encoding='utf-8').read()

html = dev
html = html.replace('<link rel="stylesheet" href="src/style.css">', '<style>\n' + css + '\n</style>')
html = html.replace('<script src="src/data.js"></script>', '<script>\n' + data + '\n</script>')
html = html.replace('<script src="src/scenes.js"></script>', '<script>\n' + scenes + '\n</script>')
html = html.replace('<script src="src/app.js"></script>', '<script>\n' + app + '\n</script>')
html = html.replace('<title>WATER feat. miku — Desmos MV</title>', '<title>WATER feat. miku — Desmos MV</title>\n<!-- 单文件交付版：图形由 Desmos API 实时演算，网页负责音频、时间轴与字幕。 -->')
open(os.path.join(root, 'index.html'), 'w', encoding='utf-8').write(html)
print('wrote', os.path.join(root, 'index.html'), len(html), 'chars')
