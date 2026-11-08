# -*- coding: utf-8 -*-
import os, glob
from PIL import Image, ImageDraw, ImageFont
d = os.path.join(os.path.dirname(__file__), '..', '_test', 'batch_cues')
files = sorted(glob.glob(os.path.join(d, 'L*.png')))
cols = 5
tw, th = 480, 270
rows = (len(files)+cols-1)//cols
sheet = Image.new('RGB', (cols*tw, rows*(th+24)), (6,8,10))
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 15)
for i,f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((tw,th), Image.LANCZOS)
    x=(i%cols)*tw; y=(i//cols)*(th+24)
    sheet.paste(im,(x,y))
    draw.text((x+6,y+th+3), os.path.basename(f)[:-4], fill=(150,225,225), font=font)
out=os.path.join(d,'contact.png'); sheet.save(out); print(out, sheet.size)
