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
// Sequelize
const db = require('./database/db');

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
    });
})

app.get('/Sale', (req, res) => {
    res.sendFile(path.join(__dirname, 'sale/sale.html'));
})

app.get('/Unos', (req, res) => {
    res.sendFile(path.join(__dirname, 'unos/unos.html'));
})

app.get('/Rezervacije/osoblje', (req, res) => {
    db.osoblje.findAll().then(function(items) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(items));
    }).catch(err => {
        res.status(500).send(JSON.stringify(err));
    });
})

app.get('/Osobe', (req, res) => {
    res.sendFile(path.join(__dirname, 'osoblje/osoblje.html'))
})

function osobaJeUSali(termin, datum) {
    let rezervisaniDatum;
    let kraj = 0;
    if (termin.redovni) {
        let dayOfTheWeek = (datum.getDay() + 6) % 7;
        if (termin.dan != dayOfTheWeek) return false;
        if ((termin.semestar == ZIMSKI && ZIMSKI_SEMESTAR.includes(datum.getMonth())) 
            || (termin.semestar == LJETNI && LJETNI_SEMESTAR.includes(datum.getMonth()))) {}
        else return false;
        rezervisaniDatum = new Date();;
        kraj = termin.kraj;
        rezervisaniDatum.setFullYear(datum.getFullYear());
        rezervisaniDatum.setMonth(datum.getMonth());
        rezervisaniDatum.setHours(parseInt(termin.pocetak.substring(0, 2)));
        rezervisaniDatum.setMinutes(parseInt(termin.pocetak.substring(3, 5)));
    } else {
        let datumElementi = termin.datum.split('.');
        rezervisaniDatum = new Date(datumElementi[1] + '/' + datumElementi[0] + '/' + datumElementi[2]);
        rezervisaniDatum.setHours(parseInt(termin.pocetak.substring(0, 2)));
        rezervisaniDatum.setMinutes(parseInt(termin.pocetak.substring(3, 5)));
        if (rezervisaniDatum.getMonth() != datum.getMonth() || rezervisaniDatum.getFullYear() != datum.getFullYear() || rezervisaniDatum.getDate() != datum.getDate()) {
            return false;
        }
        kraj = termin.kraj;
    }
    if ((datum - rezervisaniDatum) >= 0 && 
        (parseInt(kraj.substring(0, 2)) > datum.getHours()
        || parseInt(kraj.substring(0, 2)) == datum.getHours() 
            && parseInt(kraj.substring(3, 5)) > datum.getMinutes())) {
                return true;
            }
            
    return false;
}

function dobaviRezervaciju(terminId, salaId) {
    return db.termin.findOne({where: {id: terminId}}).then(termin => {
        return db.sala.findOne({where: {id: salaId}}).then(sala => {
            let preklapanje = false;
            if (osobaJeUSali(termin, new Date())) {
                preklapanje = true;
            }
            return {
                preklapanje: preklapanje,
                rezervacija: {
                    sala: sala,
                    termin: termin
                }
            };
        });
    });
}

async function dobaviZauzecaPoOsobi(osoba) {
    return db.rezervacija.findAll({where: {osoba: osoba.id}}).then(rezervacije => {
        let promises = [];
        rezervacije.forEach(rez => {
            promises.push(dobaviRezervaciju(rez.termin, rez.sala));
        });
        return Promise.all(promises).then(rezervacijeResult => {
            let trenutnaSala = null;
            let trenutniTermin = null;
            rezervacijeResult.forEach(rezOsobe => {
                if (rezOsobe.preklapanje) {
                    trenutnaSala = rezOsobe.rezervacija.sala;
                    trenutniTermin = rezOsobe.rezervacija.termin;
                }
            });
            return {
                osoba: osoba,
                trenutnaSala: trenutnaSala,
                trenutniTermin: trenutniTermin,
                rezervacije: rezervacijeResult
            }
        });
    });    
}

app.get('/osoblje', (req, res) => {
    db.osoblje.findAll().then(function(osobljeLista) {
        let promises = [];
        osobljeLista.forEach(osoba => {
            promises.push(dobaviZauzecaPoOsobi(osoba));
        });
        Promise.all(promises).then(result => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(result));
        }).catch(err => {
            res.status(500).send(JSON.stringify(err));
        });
    }).catch(err => {
        res.status(500).send(JSON.stringify(err));
    });
})

app.get('/Rezervacije', (req, res) => {
    res.sendFile(path.join(__dirname, 'rezervacije/rezervacije.html'));
})

app.get('/Rezervacije/sale', (req, res) => {
    db.sala.findAll().then(sale => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(sale));
    }).catch(err => {
        res.status(500).send(JSON.stringify(err));
    });
})

app.get('/zauzeca', (req, res) => {
    var zauzeca = {
        redovna: [],
        vanredna: []
    };
    db.rezervacija.findAll().then(function(rezervacije) {
        rezervacije.forEach(function (rezervacija, index) {
            db.osoblje.findOne({where: {id: rezervacija.osoba}}).then(osoba => {
                db.sala.findOne({where: {id: rezervacija.sala}}).then(sala => {
                    db.termin.findOne({where: {id: rezervacija.termin}}).then(termin => {
                        if (termin.redovni) {
                            zauzeca.redovna.push({
                                dan: termin.dan,
                                semestar: termin.semestar,
                                pocetak: termin.pocetak.toString().substring(0, 5),
                                kraj: termin.kraj.toString().substring(0, 5),
                                naziv: sala.naziv,
                                predavac: osoba.ime + ' ' + osoba.prezime
                            });
                        } else {
                            zauzeca.vanredna.push({
                                datum: termin.datum,
                                pocetak: termin.pocetak.toString().substring(0, 5),
                                kraj: termin.kraj.toString().substring(0, 5),
                                naziv: sala.naziv,
                                predavac: osoba.ime + ' ' + osoba.prezime
                            });
                        }
                        if (index == rezervacije.length - 1) {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify(zauzeca));
                        }
                    }).catch(err => {
                        res.status(500).send(JSON.stringify(err));
                    });
                }).catch(err => {
                    res.status(500).send(JSON.stringify(err));
                });
            }).catch(err => {
                res.status(500).send(JSON.stringify(err));
            });
        });
    }).catch(err => {
        res.status(500).send(JSON.stringify(err));
    });
})

function osobaPostoji(osobaId) {
    return db.osoblje.count({where: {id: osobaId}}).then(count => {
        return (count > 0) ? true : false;
    });
}

function salaPostoji(salaId) {
    return db.sala.count({where: {id: salaId}}).then(count => {
        return (count > 0) ? true : false;
    })
}

function preklapajuSe(termin1, termin2) {
    let preklapanjeUSatima = ((termin1.pocetak <= termin2.pocetak && termin1.kraj >= termin2.kraj) 
                        || (termin2.pocetak <= termin1.pocetak && termin2.kraj > termin1.pocetak) 
                        || (termin2.pocetak < termin1.kraj && termin2.kraj >= termin1.kraj));
    if (!preklapanjeUSatima) return false;
        
    if (termin1.redovni) {
        if (termin2.redovni && termin1.semestar == termin2.semestar && termin1.dan == termin2.dan) {
            return true;
        } else if (termin2.redovni == false) {
            datumElementi = termin2.datum.split('.');
            datum = new Date(datumElementi[1] + '/' + datumElementi[0] + '/' + datumElementi[2]);
            let dayOfTheWeek = (datum.getDay() + 6) % 7;
            return (termin1.dan == dayOfTheWeek 
                && ((termin1.semestar == ZIMSKI && ZIMSKI_SEMESTAR.includes(datum.getMonth())) 
                    || (termin1.semestar == LJETNI && LJETNI_SEMESTAR.includes(datum.getMonth())))) ? 
                true : false;
        }
    } else {
        if (termin2.redovni) {
            datumElementi = termin1.datum.split('.');
            datum = new Date(datumElementi[1] + '/' + datumElementi[0] + '/' + datumElementi[2]);
            let dayOfTheWeek = (datum.getDay() + 6) % 7;
            return (termin2.dan == dayOfTheWeek 
                && ((termin2.semestar == ZIMSKI && ZIMSKI_SEMESTAR.includes(datum.getMonth())) 
                    || (termin2.semestar == LJETNI && LJETNI_SEMESTAR.includes(datum.getMonth())))) ?
                true : false;
        } else return (termin1.datum == termin2.datum) ? 
            true : false;
    }
}

app.post('/zauzeca', (req, res) => {
    const DANI = ['Ponedjeljkom', 'Utorkom', 'Srijedom', 'Cetvrtkom', 'Petkom', 'Subotom', 'Nedjeljom'];
    let rezervacija = req.body;
    if (rezervacija.termin.pocetak == rezervacija.termin.kraj) {
        res.status(400).send(new Error('Vrijeme pocetka i vrijeme kraja ne mogu biti isti!'));
        return;
    }
    if (rezervacija.termin.pocetak > rezervacija.termin.kraj) {
        res.status(400).send(new Error('Vrijeme pocetka ne moze biti vece od vremena kraja!'));
        return;
    }

    rezervacija.termin.pocetak = rezervacija.termin.pocetak + ':00';
    rezervacija.termin.kraj = rezervacija.termin.kraj + ':00';
    rezervacija.termin.dan = (rezervacija.termin.dan == '') ? null : parseInt(rezervacija.termin.dan);
    rezervacija.termin.redovni = (rezervacija.termin.redovni == true) || (rezervacija.termin.redovni == 'true');
    
    let promises = [];
    db.osoblje.findAll().then(osobljeLista => {
        osobljeLista.forEach(osoba => {
            promises.push(dobaviZauzecaPoOsobi(osoba));
        });
        Promise.all(promises).then(result => {
            Promise.all([osobaPostoji(rezervacija.osoba.id), salaPostoji(rezervacija.sala.id)]).then(postoje => {
                for (postoji of postoje) {
                    if (!postoji) {
                        res.status(400).send(new Error('Izabrana osoba i/ili sala ne postoje!'));
                    }
                }
                for (element of result) {
                    for (rez of element.rezervacije) {
                        if (rezervacija.sala.id == rez.rezervacija.sala.id && preklapajuSe(rezervacija.termin, rez.rezervacija.termin)) {
                            let err =  new Error('Sala ' + rez.rezervacija.sala.naziv + ' je rezervisana u terminu: '
                                + rez.rezervacija.termin.pocetak + ' - ' + rez.rezervacija.termin.kraj + '.Od strane: '
                                + element.osoba.ime + ' ' + element.osoba.prezime + ', Uloga: ' + element.osoba.uloga + '!');
                            res.status(400).send(JSON.stringify(err.message));
                            return;
                        } else if (rezervacija.osoba.id == element.osoba.id && preklapajuSe(rezervacija.termin, rez.rezervacija.termin)) {
                            let err =  ((rez.rezervacija.termin.redovni) ?
                                new Error('Osoba: ' + element.osoba.ime + ' ' + element.osoba.prezime 
                                    + ' ima Redovnu rezervaciju sale: ' + rez.rezervacija.sala.naziv + ', ' 
                                    + DANI[rez.rezervacija.termin.dan] + ', U terminu: '
                                    + rez.rezervacija.termin.pocetak + ' - ' + rez.rezervacija.termin.kraj 
                                    + ' koja se preklapa sa trazenom rezervacijom!') :
                                new Error('Osoba: ' + element.osoba.ime + ' ' + element.osoba.prezime 
                                    + ' ima Vanrednu rezervaciju sale: ' + rez.rezervacija.sala.naziv + ', Datuma: ' 
                                    + rez.rezervacija.termin.datum + ', U terminu: '
                                    + rez.rezervacija.termin.pocetak + ' - ' + rez.rezervacija.termin.kraj 
                                    + ' koja se preklapa sa trazenom rezervacijom!'));
                            res.status(400).send(JSON.stringify(err.message));
                            return;
                        }
                    }
                }
                // Uspjesno prosle sve provjere
                db.termin.create(rezervacija.termin).then(t => {
                    db.rezervacija.create({}).then(r => {
                        r.osoba = rezervacija.osoba.id;
                        r.sala = rezervacija.sala.id;
                        r.termin = t.id;
                        r.save().then(_ => {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify(t));
                        }).catch(err => {
                            res.status(500).send(JSON.stringify(err.message));
                        });
                    }).catch(err => {
                        res.status(500).send(JSON.stringify(err.message));
                    });
                }).catch(err => {
                    res.status(500).send(JSON.stringify(err.message));
                });
            }).catch(err => {
                res.status(500).send(JSON.stringify(err.message));
            });
        }).catch(err => {
            res.status(500).send(JSON.stringify(err.message));
        });
    }).catch(err => {
        res.status(500).send(JSON.stringify(err.message));
    });
})

app.listen(8080, () => {
    console.log("Slusam port 8080!");
})

module.exports = app;