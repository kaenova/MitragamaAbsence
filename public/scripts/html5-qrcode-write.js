function renderQR(){
    if (document.getElementById('nama').value != '' && document.getElementById('kelas').value != '' && document.getElementById('nohp').value != '') {
        document.getElementById('qrcode').innerHTML = ""
        var input = '{ "Nama": "'+document.getElementById('nama').value+'", "Kelas": "'+document.getElementById('kelas').value+'", "WAOrtu": "'+document.getElementById('nohp').value+'" }'
        var qrcode = new QRCode(document.getElementById("qrcode"), {
            text: input,
            width: 1080,
            height: 1080,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
        
        base = ''
        
        qrcode._oDrawing._elImage.onload = ev => { 
            base = ev.target.src

            var obj = {
                img : base,
                nama: document.getElementById('nama').value,
                kelas: document.getElementById('kelas').value
            }
            
            
            var options = {
                method: 'POST',
                headers: {
                    "Content-type" : "application/json; charset=UTF-8"
                },
                body: JSON.stringify(obj)
            }
            fetch('/qr', options)
        }
    }
}


