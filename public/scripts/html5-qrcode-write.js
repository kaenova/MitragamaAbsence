function renderQR(){
    if (document.getElementById('nama').value != '' && document.getElementById('kelas').value != '' && document.getElementById('nohp').value != '') {
        var base

        document.getElementById('qrcode').innerHTML = ""
        var input = '{ "Nama": "'+document.getElementById('nama').value+'", "Kelas": "'+document.getElementById('kelas').value+'", "WAOrtu": "'+document.getElementById('nohp').value+'" }'

        var qrcode = new QRCode(document.getElementById("qrcode"), {
            text: input,
            width: document.body.clientWidth,
            height: document.body.clientWidth,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        var obj = {
            img : '',
            nama: document.getElementById('nama').value,
            kelas: document.getElementById('kelas').value
        }

        
        var bruh = function(ev) { 
            base = ev.target.src
            return base
        }

        console.log(obj)   
        
        var options = {
            method: 'POST',
            headers: {
                "Content-type" : "application/json"
            },
            body: JSON.stringify(obj)
        }
        fetch('/qr', options)

        
    } else {
        alert("Masukkan dengan lengkap")
    }
}


