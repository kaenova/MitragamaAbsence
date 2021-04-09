function renderQR(){
    if (document.getElementById('nama').value != '' && document.getElementById('kelas').value != '' && document.getElementById('nohp').value != '') {
        var base

        document.getElementById('qr').innerHTML = ""
        var input = '{ "Nama": "'+document.getElementById('nama').value+'", "Kelas": "'+document.getElementById('kelas').value+'", "WAOrtu": "'+document.getElementById('nohp').value+'" }'

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

        console.log(image)

        var obj = {
            img : image,
            nama: document.getElementById('nama').value,
            kelas: document.getElementById('kelas').value,
            no_hp: document.getElementById('nohp').value
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