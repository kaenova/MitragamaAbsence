const express = require('express')
const fs = require('fs');
const bodyParser = require('body-parser')
const CSVtoJSON = require('csvtojson')
const JSONtoCSV = require('json2csv').parse
const key = fs.readFileSync('./ssl/key.pem');
const cert = fs.readFileSync('./ssl/cert.pem');
const https = require('https');

const app = express()
const port = 443

const server = https.createServer({key: key, cert: cert }, app);

server.listen(port, () => console.log('listening to the port', port))
app.use(express.static('./public'))
app.use(bodyParser.json());

var last_body_absen
var last_body_qr

app.post('/absen', (req, res) => {
    var date = new Date()
    
    var jam = String(date.getHours())+":"+String(date.getMinutes())
    var tanggal = date.getDate()
    var bulan = date.getMonth() + 1
    var tahun = date.getFullYear()
    var waktu = tanggal + "-" + bulan + '-' + tahun
    
    var obj = req.body

    if (('Nama' in obj) && ('Kelas' in obj) && ('WAOrtu' in obj) && (last_body_absen != obj)){
        var path = "./daftar_hadir/daftar_hadir["+waktu+"].csv"
        if(fs.existsSync(path) == false){
            fs.writeFileSync(path, '.csv')
        }
    
        res.status(200).send({
            nama: obj['Nama'],
            waktu: "Jam : "+jam+" Tanggal : "+tanggal
        })
        
    
        CSVtoJSON().fromFile(path).then(source =>{
            source.push({
                "jam": jam,
                "waktu": waktu,
                "nama": obj['Nama'],
                "kelas": obj['Kelas'],
                "no_hp": obj['WAOrtu']
            })
            const csv = JSONtoCSV(source, {fields: ["jam","waktu", "nama", "kelas", "no_hp"]})
            fs.writeFileSync(path, csv)
        })
        
        console.log(obj['Nama']+ " baru saja absen")
        res.end()

        last_body_absen = obj
        
    } else {
        res.status(401).send({
            message: "QR not valid"
        }).end
    }
    
})

app.post('/qr', (req, res) => {

    var obj = req.body
    if (('img' in obj) && ('nama' in obj) && ('kelas' in obj) && (last_body_qr != obj)){
        
        var path = "./data_siswa/daftar_QR_siswa.csv"
        if(fs.existsSync(path) == false){
            fs.writeFileSync(path, '.csv')
        }
        
    
        CSVtoJSON().fromFile(path).then(source =>{
            source.push({
                "nama": obj['nama'],
                "kelas": obj['kelas'],
                "no_hp": obj['no_hp'],
                "QR":obj['img']
            })
            const csv = JSONtoCSV(source, {fields: ['nama', 'kelas', 'no_hp', 'QR']})
            fs.writeFileSync(path, csv)
        })

        console.log('New Data on data_siswa with name '+obj['nama'])

        res.status(200).send({
            nama: obj['nama'],
            kelas: obj['kelas']
        }).end()

        last_body_qr = obj


    } else {
        res.sendStatus(401).send({
            msg: 'Not Valid!'
        })
    }

    
})
