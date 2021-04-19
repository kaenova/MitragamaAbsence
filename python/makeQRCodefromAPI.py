import sys
import qrcode
import re
from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw 

#defining all variables
nama_file = sys.argv[1]
json = sys.argv[2]
nama_orang = sys.argv[3]
nama_depan_split = nama_orang.split()
pattern = "(M|m)uham*"
if (re.search(pattern, nama_depan_split[0])):
    nama_depan = nama_depan_split[1]
else: 
    nama_depan = nama_depan_split[0]
status = sys.argv[4]
path = './data_siswa/QR_{}.jpg'.format(nama_file)
path_kartu = './data_siswa/Kartu_{}.jpg'.format(nama_file)
clean_path = './python/Clean.jpg'

#making and saving QR Code
img = qrcode.make(json)
img.save(path)

#resizing QR Code to 450px x 450px
qr = Image.open(path)
basewidth = 450
wpercent = (basewidth/float(qr.size[0]))
hsize = int((float(qr.size[1])*float(wpercent)))
qr = qr.resize((basewidth,hsize), Image.ANTIALIAS)
qr.save(path)

# Membuat Kartu
clean = Image.open(clean_path)
draw = ImageDraw.Draw(clean)
font1 = ImageFont.truetype("./python/Poppins-Bold.ttf", 70)
font2 = ImageFont.truetype("./python/Poppins-Light.ttf", 60)
draw.text((100, 103),nama_depan,(255,255,255),font=font1)
draw.text((100, 180),status,(255,255,255),font=font2)

basewidth = 270
wpercent = (basewidth/float(qr.size[0]))
hsize = int((float(qr.size[1])*float(wpercent)))
qr = qr.resize((basewidth,hsize), Image.ANTIALIAS)
clean.paste(qr,(351,709))

clean.save(path_kartu)