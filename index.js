const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors')
const fs = require('fs');
app = express();
const path = require('path');
const _ = require('lodash');
const ZIMSKI_SEMESTAR = [9, 10, 11, 0];
const LJETNI_SEMESTAR = [1, 2, 3, 4]
const LJETNI = "ljetni";
const ZIMSKI = "zimski";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    return res.redirect('/Pocetna');
})

app.get('/Pocetna', (req, res) => {
    res.sendFile(path.join(__dirname, 'pocetna/pocetna.html'));
})

app.get('/Pocetna/slike', (req, res) => {
    fs.readdir([__dirname, '/images'].join(''), function (err, files) {
        let images = [];
        _.each(files, function(imageFIle) {
            let bitmap = fs.readFileSync([__dirname, '/images', '/', imageFIle].join(''));
            bitmap = "data:image/jpeg;base64," + new Buffer(bitmap).toString('base64');
            images.push(bitmap);
        })
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(images));
    })
})

app.get('/Sale', (req, res) => {
    res.sendFile(path.join(__dirname, 'sale/sale.html'));
})

app.get('/Unos', (req, res) => {
    res.sendFile(path.join(__dirname, 'unos/unos.html'));
})

app.get('/Rezervacije', (req, res) => {
    res.sendFile(path.join(__dirname, 'rezervacije/rezervacije.html'));
})

app.get('/Rezervacije/zauzeca', (req, res) => {
    fs.readFile('zauzeca.json', function (err, data) {
        if (err) {
            res.writeHead(504, {'Content-Type': 'application/json'});
            throw err;
        }
        let zauzeca = JSON.parse(data);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(zauzeca));
    })
})

app.post('/Rezervacije/zauzeca', (req, res) => {
    const DANI = ["Ponedjeljak", "Utorak", "Srijeda", "Cetvrtak", "Petak", "Subota", "Nedjelja"];
    fs.readFile('zauzeca.json', function(err, data) {
        if (err) {
            res.writeHead(504, {'Content-Type': 'application/json'});
            throw err;
        }
        let zauzeca = JSON.parse(data);
        let zauzece = req.body;
        if (mozeSeRezervisati(zauzeca, zauzece)) {
            if (zauzece.periodicno != null) {
                zauzeca.periodicna.push(zauzece.periodicno);
            } else {
                zauzeca.vanredna.push(zauzece.vanredno);
            }
            fs.writeFileSync('zauzeca.json', JSON.stringify(zauzeca, null, 2), (err) => {
                if (err) throw err;
            });
        } else {
            res.writeHead(400, {'Content-Type': 'text/html'});
            if (zauzece.periodicno != null) {
                res.end("Nije moguce rezervisati salu: " + zauzece.periodicno.naziv + " za navedeni dan: " + DANI[zauzece.periodicno.dan] + " za " + zauzece.periodicno.semestar + " semestar " + " u terminu: " + zauzece.periodicno.pocetak + " - " + zauzece.periodicno.kraj);
            } else {
                res.end("Nije moguce rezervisati salu: " + zauzece.vanredno.naziv + " za navedeni datum: " + zauzece.vanredno.datum + " u terminu: " + zauzece.vanredno.pocetak + " - " + zauzece.vanredno.kraj);
            }
            return;
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(zauzeca));
    })
})

function mozeSeRezervisati(zauzecaJSON, zauzece) {
    let BreakException = {};
    let zauzeca = null;
    if (zauzece.periodicno != null) {
        zauzeca = dajZauzecaPoSali(zauzecaJSON, zauzece.periodicno.naziv);
    }else {
        zauzeca = dajZauzecaPoSali(zauzecaJSON, zauzece.vanredno.naziv);
    }
    if (zauzeca != null) {
        try {     
            zauzeca.periodicna.forEach(element => {
                if (zauzece.periodicno != null) {
                    let preklapanjeUSatima = ((element.pocetak <= zauzece.periodicno.pocetak && element.kraj >= zauzece.periodicno.kraj) 
                        || (zauzece.periodicno.pocetak <= element.pocetak && zauzece.periodicno.kraj > element.pocetak) 
                        || (zauzece.periodicno.pocetak < element.kraj && zauzece.periodicno.kraj >= element.kraj));
                    if (element.dan == zauzece.periodicno.dan && preklapanjeUSatima && element.semestar == zauzece.semestar) throw BreakException;
                } else {
                    let preklapanjeUSatima = ((element.pocetak <= zauzece.vanredno.pocetak && element.kraj >= zauzece.vanredno.kraj) 
                        || (zauzece.vanredno.pocetak <= element.pocetak && zauzece.vanredno.kraj > element.pocetak) 
                        || (zauzece.vanredno.pocetak < element.kraj && zauzece.vanredno.kraj >= element.kraj));
                    let datumElementi = zauzece.vanredno.datum.split('.');
                    let datum = new Date(datumElementi[1] + '/' + datumElementi[0] + '/' + datumElementi[2]);
                    let danUSedmici = datum.getDay() - 1;
                    if (danUSedmici < 0) danUSedmici += 7;
                    let semestarElement = (element.semestar == ZIMSKI) ? ZIMSKI_SEMESTAR : LJETNI_SEMESTAR;
                    if (semestarElement.includes(parseInt(datumElementi[1]) - 1) && element.dan == danUSedmici & preklapanjeUSatima) throw BreakException;
                }
            })

            zauzeca.vanredna.forEach(element => {
                if (zauzece.periodicno != null) {
                    let preklapanjeUSatima = ((element.pocetak <= zauzece.periodicno.pocetak && element.kraj >= zauzece.periodicno.kraj) 
                        || (zauzece.periodicno.pocetak <= element.pocetak && zauzece.periodicno.kraj > element.pocetak) 
                        || (zauzece.periodicno.pocetak < element.kraj && zauzece.periodicno.kraj >= element.kraj));
                    let datumElementi = element.datum.split('.');
                    let datum = new Date(datumElementi[1] + '/' + datumElementi[0] + '/' + datumElementi[2]);
                    let danUSedmici = datum.getDay() - 1;
                    let semestarZauzece = (zauzece.semestar == ZIMSKI) ? ZIMSKI_SEMESTAR : LJETNI_SEMESTAR;
                    if (danUSedmici < 0) prviDan += 7;

                    if (semestarZauzece.includes(parseInt(datumElementi[1]) - 1) && danUSedmici == zauzece.periodicno.dan && preklapanjeUSatima) throw BreakException;
                } else {
                    let preklapanjeUSatima = ((element.pocetak <= zauzece.vanredno.pocetak && element.kraj >= zauzece.vanredno.kraj) 
                        || (zauzece.vanredno.pocetak <= element.pocetak && zauzece.vanredno.kraj > element.pocetak) 
                        || (zauzece.vanredno.pocetak < element.kraj && zauzece.vanredno.kraj >= element.kraj));
                    if (element.datum == zauzece.vanredno.datum && preklapanjeUSatima) throw BreakException;
                }
            })
        } catch (e) {
            if (e != BreakException) throw e;
            return false;
        }
    }
    return true;
}

function dajZauzecaPoSali(zauzecaJSON, sala) {
    let zauzeca = { periodicna: new Array(), vanredna: new Array() };
    let periodicnaZauzeca = zauzecaJSON.periodicna;
    let vanrednaZauzeca = zauzecaJSON.vanredna;
    
    if (periodicnaZauzeca != null) {
        periodicnaZauzeca.forEach(element => {
            if(element.naziv == sala) {
                zauzeca.periodicna.push(element);
            }
        })
        
    }
    if (vanrednaZauzeca != null) {
        vanrednaZauzeca.forEach(element => {
            if (element.naziv == sala) {
                zauzeca.vanredna.push(element);
            }
        })
    }
    return zauzeca;
}

app.listen(8080, () => {
    console.log("Slusam port 8080!");
})