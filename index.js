const express = require('express')
const fs = require('fs');
const bodyParser = require('body-parser')
const CSVtoJSON = require('csvtojson')
const JSONtoCSV = require('json2csv').parse
const key = fs.readFileSync('./ssl/key.pem');
const cert = fs.readFileSync('./ssl/cert.pem');
const https = require('https');
const schedule = require('node-schedule');
const convertCsvToXlsx = require('@aternus/csv-to-xlsx');
const bruh = require('path')

const { spawn } = require('child_process');
const { CallTracker } = require('assert');
const { scheduleJob } = require('node-schedule');

const app = express()
const port = 443

app.set('trust proxy')

// Redirect from http to https
const http = express();
http.get('*', function(req, res) {  
    res.redirect('https://' + req.headers.host + req.url);
})
http.listen(8080);

// Create https server
const server = https.createServer({key: key, cert: cert }, app);

server.listen(port, () => {console.log('listening to the port', port)})
app.use(express.static('./public'))
app.use(bodyParser({limit: '10MB'}))

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
        

        last_body_absen = obj

        try {

            const childPythonClearAbsen = spawn('python', ['./python/clear_multiple_data_absen.py', path])

            childPythonClearAbsen.stdout.on('data', (data) => {
                console.log(data.toString())
            })
            childPythonClearAbsen.stderr.on('data', (data) => {
                console.log(data.toString())
            })

        } catch(err){
            console.log('Failed to Editing csv using python after inserting '+ obj['Nama'])
        }

        res.send(JSON.stringify({
            nama:obj['Nama'],
            kelas:obj['Kelas'],
            waktu: waktu,
            jam: jam
        }))
        res.end()
       
    } else {
        res.status(401).send({
            message: "QR not valid"
        }).end
    }
    
})

app.post('/qr', (req, res) => {

    var obj = req.body
    if (('img' in obj) && ('nama' in obj) && ('kelas' in obj) && (last_body_qr != obj)){

        var date = new Date()
    
        var jam = String(date.getHours())+""+String(date.getMinutes())
        var tanggal = date.getDate()
        var bulan = date.getMonth() + 1
        var tahun = date.getFullYear()
        var waktu = tanggal + "-" + bulan + '-' + tahun+'-'+jam

        var filename = 'daftar_QR_siswa'
        var path = "./data_siswa/daftar_QR_siswa.csv"
        var extension = '.csv'
        var path = './data_siswa/'+filename+extension
        if(fs.existsSync(path) == false){
            fs.writeFileSync(path, '.csv')
        }

        var path_backup = './backup/'+filename+'_backup'+extension

        fs.copyFileSync(path, path_backup)
        
        var nomor_hp = obj['no_hp']

        CSVtoJSON().fromFile(path).then(source =>{
            source.push({
                "nama": obj['nama'],
                "kelas": obj['kelas'],
                "no_hp":  nomor_hp,
                "file": obj['nama']+'-'+obj['kelas']+'.png',
            })
            const csv = JSONtoCSV(source, {fields: ['nama', 'kelas', 'no_hp', 'file']})
            fs.writeFileSync(path, csv)
        })

        var image = '{ "Nama": "'+obj['nama']+'", "Kelas": "'+obj['kelas']+'", "WAOrtu": "'+"+62"+obj['no_hp']+'" }'

        try {
            const childPythonClearQR = spawn('python', ['./python/clear_multiple_data_qr.py', path]).on('error', ()=>{
                console.log('error coy!')
            })

            childPythonClearQR.stdout.on('data', (data) => {
                console.log(data.toString())
            })
            childPythonClearQR.stderr.on('data', (data) => {
                console.log(data.toString())
            })

        } catch(err){
            console.log('Failed to Editing csv using python after inserting '+ obj['nama']+'\n Please Check on Backup File Immediately')
        }

        try {
            const childPythonSaveQR = spawn('python', ['./python/makeQRCodefromAPI.py', obj['nama']+'-'+obj['kelas'], image, obj['nama'], obj['kelas']])

            childPythonSaveQR.stdout.on('data', (data) => {
                console.log(data.toString())
            })
            childPythonSaveQR.stderr.on('data', (data) => {
                console.log(data.toString())
            })

        } catch (err){
            console.log('error when creating QR Code image data')
            console.log(err)
        }

        console.log('New Data on data_siswa with name '+obj['nama'])

        last_body_qr = obj

        res.send(JSON.stringify({
            nama: obj['nama'],
            kelas: obj['kelas']
        })).status(200)
        res.end()

    } else {
        res.sendStatus(401).send(JSON.stringify({
            msg: 'Not Valid!'
        }))
    }
  
})


app.get('/kehadiran', (req, res) => {

})

const rekap = schedule.scheduleJob({
    hour: 23,
    second: 45
}, () => {
    var date = new Date()
    var jam = String(date.getHours())+":"+String(date.getMinutes())
    var tanggal = date.getDate()
    var bulan = date.getMonth() + 1
    var tahun = date.getFullYear()
    var waktu = tanggal + "-" + bulan + '-' + tahun
    var path = "./daftar_hadir/daftar_hadir["+waktu+"].csv"
    if (fs.existsSync(path)) {
        var asal = bruh.join(__dirname, '/daftar_hadir', '/daftar_hadir['+waktu+'].csv');
        var convert = bruh.join(__dirname, '/rekap_daftar_hadir', '/rekap_daftar_hadir['+waktu+'].xlsx');
        try {
            convertCsvToXlsx(asal, convert);
            console.log('Membuat rekapitulasi absensi untuk '+ waktu)
        } catch (e) {
            console.error(e.toString());
        }
    } else{
        console.log('Tidak ada absensi untuk '+waktu)
    }
})
