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

var last_body


app.post('/absen', (req, res) => {
    var date = new Date()
    
    var jam = String(date.getHours())+":"+String(date.getMinutes())
    var tanggal = date.getDate()
    var bulan = date.getMonth() + 1
    var tahun = date.getFullYear()
    var waktu = tanggal + "-" + bulan + '-' + tahun
    
    var obj = req.body

    if (('Nama' in obj) && ('Kelas' in obj) && ('WAOrtu' in obj) && (last_body != obj)){
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
    
        res.end()

        last_body = obj
        
    } else {
        res.status(401).send({
            message: "QR not valid"
        }).end
    }
    
})