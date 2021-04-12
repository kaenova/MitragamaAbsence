var latest_render = ''

function renderQR(){
    if (document.getElementById('nama').value != '' && document.getElementById('kelas').value != '' && document.getElementById('nohp').value != '' && document.getElementById('nama').value+document.getElementById('kelas').value+document.getElementById('nohp').value != latest_render) {
        var base

        document.getElementById('qr').innerHTML = ""
        var input = '{ "Nama": "'+document.getElementById('nama').value+'", "Kelas": "'+document.getElementById('kelas').value+'", "WAOrtu": "'+"+62"+String(document.getElementById('nohp').value)+'" }'

        var qr = new QRious({
            element: document.getElementById('qr'),
            value: input,
            size:document.body.clientWidth
        })

        var canvas = document.getElementById("qr");
        var image = canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
        var link = document.createElement('a');
        link.download = document.getElementById('nama').value+"-"+document.getElementById('kelas').value+".png";
        link.href = image;
        link.click();

        console.log('+62'+String(document.getElementById('nohp').value))

        var obj = {
            img : image,
            nama: document.getElementById('nama').value,
            kelas: document.getElementById('kelas').value,
            no_hp: '+62'+String(document.getElementById('nohp').value)
        }
        
        var options = {
            method: 'POST',
            headers: {
                "Content-type" : "application/json"
            },
            body: JSON.stringify(obj)
        }
        fetch('/qr', options).then(response => response.json()).then(data => {
            alert('Data '+data.nama+' untuk kelas '+data.kelas+' sudah tersimpan')
        })

        latest_render = document.getElementById('nama').value+document.getElementById('kelas').value+document.getElementById('nohp').value

    } else {
        alert("Masukkan belum lengkap atau form sebelumnya sudah tersimpan")
    }
}