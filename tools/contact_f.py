# -*- coding: utf-8 -*-
import os, sys, glob
from PIL import Image, ImageDraw, ImageFont
d = os.path.join(os.path.dirname(__file__), '..', '_test', 'batch_f')
files = sorted(glob.glob(os.path.join(d, '*.png')))
if not files:
    print('no files'); sys.exit()
cols = 3
tw, th = 640, 360
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw, rows * (th + 26)), (8, 8, 10))
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 16)
except Exception:
    font = ImageFont.load_default()
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
    x = (i % cols) * tw; y = (i // cols) * (th + 26)
    sheet.paste(im, (x, y))
    draw.text((x + 8, y + th + 4), os.path.basename(f)[:-4], fill=(160, 230, 230), font=font)
out = os.path.join(d, 'contact.png')
sheet.save(out)
print(out, sheet.size)

