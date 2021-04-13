import sys
import qrcode

nama = sys.argv[1]
img = qrcode.make(sys.argv[2])

img.save('./data_siswa/{}.png'.format(nama))