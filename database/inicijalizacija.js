const db = require('./db.js');

function inicijaliziraj() {
    db.sequelize.sync({force: true}).then(function() {
        inicijalizacija().then(function() {
            console.log("Gotovo kreiranje tabela i ubacivanje pocetnih podataka");
            return;
        });
    });
}

function inicijalizacija() {
    var osobljeListaPromisea = [];
    var saleListaPromisea = [];
    var terminListaPromisea =[];
    var rezervacijaListaPromisea = [];

    return new Promise(function(resolve, reject) {
        osobljeListaPromisea.push(db.osoblje.create({ime: 'Neko', prezime: 'Nekić', uloga: 'profesor'}));
        osobljeListaPromisea.push(db.osoblje.create({ime: 'Drugi', prezime: 'Neko', uloga: 'asistent'}));
        osobljeListaPromisea.push(db.osoblje.create({ime: 'Test', prezime: 'Test', uloga: 'asistent'}));

        Promise.all(osobljeListaPromisea).then(function(osoblje) {
            var osoba1 = osoblje.filter(function(o) {return o.ime === 'Neko'})[0];
            var osoba2 = osoblje.filter(function(o) {return o.ime === 'Drugi'})[0];
            var osoba3 = osoblje.filter(function(o) {return o.ime === 'Test'})[0];

            saleListaPromisea.push(
                db.sala.create({naziv: '1-11'}).then(function(s) {
                    s.setOsoba([osoba1.id]);
                    return new Promise(function(resolve, reject) { resolve(s); })
                })
            );
            saleListaPromisea.push(
                db.sala.create({naziv: '1-15'}).then(function(s) {
                    s.setOsoba([osoba2.id]);
                    return new Promise(function(resolve, reject) { resolve(s); })
                })
            );
            
            Promise.all(saleListaPromisea).then(function(sale) {
                var sala1 = sale.filter(function(s) { return s.naziv === '1-11'; })[0];
                var sala2 = sale.filter(function(s) { return s.naziv === '1-15'; })[0];

                terminListaPromisea.push(
                    db.termin.create({
                        redovni: false, 
                        dan: null, 
                        datum: '01.01.2020', 
                        semestar: null, 
                        pocetak: '12:00', 
                        kraj: '13:00'
                    })
                );
                terminListaPromisea.push(
                    db.termin.create({
                        redovni: true, 
                        dan: 0, 
                        datum: null, 
                        semestar: 'zimski', 
                        pocetak: '13:00', 
                        kraj: '14:00'
                    })
                );
                Promise.all(terminListaPromisea).then(function(termini) {
                    var termin1 = termini.filter(function(t) { return t.redovni === false })[0];
                    var termin2 = termini.filter(function(t) { return t.redovni === true })[0];

                    rezervacijaListaPromisea.push(
                        db.rezervacija.create({}).then(async function(r) {
                            r.sala = sala1.id;
                            r.osoba = osoba1.id;
                            r.termin = termin1.id;
                            await r.save();
                            return new Promise(function(resolve, reject) { resolve(r); });
                        })
                    );
                    rezervacijaListaPromisea.push(
                        db.rezervacija.create({}).then(async function(r) {
                            r.sala = sala1.id;
                            r.osoba = osoba3.id;
                            r.termin = termin2.id;
                            await r.save();
                            return new Promise(function(resolve, reject) { resolve(r); });
                        })
                    );
                    Promise.all(rezervacijaListaPromisea).then(
                        function(r) { 
                            resolve(r);
                    }).catch(function(err) {
                            console.log("Rezervacije, greska " + err);
                    });
                }).catch(function(err) {
                    console.log("Termini, greska " + err);
                });
            }).catch(function(err) {
                console.log("Sale, greska " + err);
            });
        }).catch(function(err) {
            console.log("Osoblje, greska " + err);
        });
    });
}


module.exports = {
    inicijaliziraj: inicijaliziraj,
    inicijalizacija: inicijalizacija
}