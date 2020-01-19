let assert = chai.assert;

describe('Kalendar', function () {

    let danas = new Date();
    const trenutnaGodina = danas.getFullYear();
    let tijeloKalendara = document.getElementById("tijelo-kalendara");
    let mjeseci = ["Januar", "Februar", "Mart", "April", "Maj", "Juni", "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"]

    describe('obojiZauzeca()', function () {
        it('Pozivanje obojiZauzeca kada podaci nisu učitani: očekivana vrijednost da se ne oboji niti jedan dan', function () {
            Kalendar.ucitajPodatke(null, null);
            let mjesec = mjeseci.indexOf('Novembar');
            Kalendar.iscrtajKalendar(tijeloKalendara, mjesec);
            Kalendar.obojiZauzeca(tijeloKalendara, mjesec, 'Sala', '06:00', '23:00');
            assert.equal(provjeriZauzece(null, null), true);
        });
        it('Pozivanje obojiZauzeca gdje u zauzecima postoje duple vrijednosti za zauzeće istog termina: očekivano je da se dan oboji bez obzira što postoje duple vrijednosti', function () {
            Kalendar.ucitajPodatke(null, [{
                datum: '21.11.2019',
                pocetak: '00:00',
                kraj: '23:00',
                naziv: 'Sala',
                predavac: 'Predavac'
            }, {
                datum: '21.11.2019',
                pocetak: '00:00',
                kraj: '23:00',
                naziv: 'Sala',
                predavac: 'Predavac'
            }]);
            let mjesec = mjeseci.indexOf('Novembar');
            Kalendar.iscrtajKalendar(tijeloKalendara, mjesec);
            Kalendar.obojiZauzeca(tijeloKalendara, mjesec, 'Sala', '06:00', '23:00');
            assert.equal(provjeriZauzece([21], null), true);
        });
        it('Pozivanje obojiZauzece kada u podacima postoji periodicno zauzece za drugi semestar: ocekivano je da se ne oboji zauzece', function () {
            Kalendar.ucitajPodatke([{
                dan: 4,
                semestar: 'ljedni',
                pocetak: '09:00',
                kraj: '10:00',
                naziv: 'Sala',
                predavac: 'Predavac'
            }], null);
            let mjesec = mjeseci.indexOf('Novembar');
            Kalendar.iscrtajKalendar(tijeloKalendara, mjesec);
            Kalendar.obojiZauzeca(tijeloKalendara, mjesec, 'Sala', '06:00', '23:00');
            assert.equal(provjeriZauzece(null, null), true);
        });
        it('Pozivanje obojiZauzece kada u podacima postoji zauzeće termina ali u drugom mjesecu: očekivano je da se ne oboji zauzeće', function () {
            Kalendar.ucitajPodatke(null, [{
                datum: '21.10.2019',
                pocetak: '00:00',
                kraj: '23:59',
                naziv: 'Sala',
                predavac: 'Predavac'
            }, {
                datum: '21.12.2019',
                pocetak: '00:00',
                kraj: '23:59',
                naziv: 'Sala',
                predavac: 'Predavac'
            }]);
            let mjesec = mjeseci.indexOf('Novembar');
            Kalendar.iscrtajKalendar(tijeloKalendara, mjesec);
            Kalendar.obojiZauzeca(tijeloKalendara, mjesec, 'Sala', '06:00', '23:00');
            assert.equal(provjeriZauzece(null, null), true);
        });
        it('Pozivanje obojiZauzece kada su u podacima svi termini u mjesecu zauzeti: očekivano je da se svi dani oboje', function () {
            Kalendar.ucitajPodatke([{
                dan: 0,
                semestar: 'zimski',
                pocetak: '00:00',
                kraj: '23:59',
                naziv: 'Sala',
                predavac: 'Predavac'
            }, {
                dan: 1,
                semestar: 'zimski',
                pocetak: '00:00',
                kraj: '23:59',
                naziv: 'Sala',
                predavac: 'Predavac'
            }, {
                dan: 2,
                semestar: 'zimski',
                pocetak: '00:00',
                kraj: '23:59',
                naziv: 'Sala',
                predavac: 'Predavac'
            }, {
                dan: 3,
                semestar: 'zimski',
                pocetak: '00:00',
                kraj: '23:59',
                naziv: 'Sala',
                predavac: 'Predavac'
            }, {
                dan: 4,
                semestar: 'zimski',
                pocetak: '00:00',
                kraj: '23:59',
                naziv: 'Sala',
                predavac: 'Predavac'
            }, {
                dan: 5,
                semestar: 'zimski',
                pocetak: '00:00',
                kraj: '23:59',
                naziv: 'Sala',
                predavac: 'Predavac'
            }, {
                dan: 6,
                semestar: 'zimski',
                pocetak: '00:00',
                kraj: '23:59',
                naziv: 'Sala',
                predavac: 'Predavac'
            }], null);
            let mjesec = mjeseci.indexOf('Novembar');
            Kalendar.iscrtajKalendar(tijeloKalendara, mjesec);
            Kalendar.obojiZauzeca(tijeloKalendara, mjesec, 'Sala', '06:00', '23:00');
            assert.equal(provjeriZauzece(null, [0, 1, 2, 3, 4, 5, 6]), true);
        });
        it('Dva puta uzastopno pozivanje obojiZauzece: očekivano je da boja zauzeća ostane ista', function () {
            Kalendar.ucitajPodatke(null, [{
                datum: '21.11.2019',
                pocetak: '00:00',
                kraj: '23:00',
                naziv: 'Sala',
                predavac: 'Predavac'
            }]);
            let mjesec = mjeseci.indexOf('Novembar');
            Kalendar.iscrtajKalendar(tijeloKalendara, mjesec);
            Kalendar.obojiZauzeca(tijeloKalendara, mjesec, 'Sala', '06:00', '23:00');
            Kalendar.obojiZauzeca(tijeloKalendara, mjesec, 'Sala', '06:00', '23:00');
            assert.equal(provjeriZauzece([21], null), true);
        });
    });

    describe('ucitajPodatke()', function () {
        it('Pozivanje ucitajPodatke, obojiZauzeca, ucitajPodatke - drugi podaci, obojiZauzeca: očekivano da se zauzeća iz prvih podataka ne ostanu obojena, tj. primjenjuju se samo posljednje učitani podaci', function () {
            Kalendar.ucitajPodatke(null, [{
                datum: '25.12.2019',
                pocetak: '00:00',
                kraj: '23:00',
                naziv: 'Sala',
                predavac: 'Predavac'
            }]);
            let mjesec = mjeseci.indexOf('Decembar');
            Kalendar.iscrtajKalendar(tijeloKalendara, mjesec);
            Kalendar.obojiZauzeca(tijeloKalendara, mjesec, 'Sala', '06:00', '23:00');
            Kalendar.ucitajPodatke(null, [{
                datum: '27.12.2019',
                pocetak: '00:00',
                kraj: '23:00',
                naziv: 'Sala',
                predavac: 'Predavac'
            }]);
            assert.equal(provjeriZauzece([27], null), true);
        });
    });

    describe('iscrtajKalendar()', function () {
        it('Pozivanje iscrtajKalendar za mjesec sa 30 dana: očekivano je da se prikaže 30 dana', function () {
            let mjesec = mjeseci.indexOf('Novembar');
            Kalendar.iscrtajKalendar(tijeloKalendara, mjesec);
            assert.equal(provjeriBrojDana(mjesec), true);
        });
        it('Pozivanje iscrtajKalendar za mjesec sa 31 dan: očekivano je da se prikaže 31 dan', function () {
            let mjesec = mjeseci.indexOf('Januar');
            Kalendar.iscrtajKalendar(tijeloKalendara, mjesec);
            assert.equal(provjeriBrojDana(mjesec), true);
        });
        it('Pozivanje iscrtajKalendar za trenutni mjesec: očekivano je da je 1. dan u petak', function () {
            let mjesec = danas.getMonth();
            Kalendar.iscrtajKalendar(tijeloKalendara, mjesec);
            assert.equal(provjeriPocetniDan(mjesec), true);
        });
        it('Pozivanje iscrtajKalendar za trenutni mjesec: očekivano je da je 30. dan u subotu', function () {
            let mjesec = danas.getMonth();
            Kalendar.iscrtajKalendar(tijeloKalendara, mjesec);
            assert.equal(provjeriPocetniDan(mjesec), true);
        });
        it('Pozivanje iscrtajKalendar za januar: očekivano je da brojevi dana idu od 1 do 31 počevši od utorka', function () {
            let mjesec = mjeseci.indexOf('Januar');
            Kalendar.iscrtajKalendar(tijeloKalendara, mjesec);
            assert.equal(provjeriPocetniDan(mjesec), true);
            assert.equal(provjeriBrojDana(mjesec), true);
        });
    });


    // Pomocna funckcija koja se poziva u assertu
    // zauzetiVanredno je lista dana koji trebaju biti zauzeti
    // zauzetiRedovno je lista dana u sedmici koji moraju biti zauzeti
    function provjeriZauzece(zauzetiVanredno, zauzetiRedovno) {
        let trElementi = tijeloKalendara.childNodes;

        for (let i = 0; i < trElementi.length && trElementi[i].tagName == 'TR'; i++) {

            let tdElementi = trElementi[i].childNodes;
            for (let j = 0; j < tdElementi.length && tdElementi[j].tagName == 'TD'; j++) {

                let element = tdElementi[j];
                if (element.innerText == '') {
                    continue;
                }
                // Provjerava ( ((Ako se dan nalazi u zauzetiVanredno) ili (Ako dan u sedmici se nalazi u zauzetiRedovno)) i (sala nije zauzeta) ) ili (sala nije slobodna) => vrati false
                if (((zauzetiVanredno != null && zauzetiVanredno instanceof Array && zauzetiVanredno.includes(element.innerText))
                    || (zauzetiRedovno != null && zauzetiRedovno instanceof Array && zauzetiRedovno.includes(j)))
                    && !element.classList.contains('zauzeta') || !element.classList.contains('slobodna')) {
                    return false;
                }
            }
        }
        return true;
    };

    function provjeriBrojDana(mjesec) {

        let trElementi = tijeloKalendara.childNodes;
        let brojDana = 0;

        for (let i = 0; i < trElementi.length && trElementi[i].tagName == 'TR'; i++) {

            let tdElementi = trElementi[i].childNodes;
            for (let j = 0; j < tdElementi.length && tdElementi[j].tagName == 'TD'; j++) {

                let element = tdElementi[j];
                if (element.innerText != '') {
                    brojDana++;
                }

            }
        }
        return brojDana == Kalendar.danaUMjesecu(mjesec, trenutnaGodina);
    }

    function provjeriPocetniDan(mjesec) {
        let prviDan = (new Date(trenutnaGodina, mjesec)).getDay() - 1;
        if (prviDan < 0) prviDan += 7;

        let trElementi = tijeloKalendara.childNodes;

        for (let i = 0; i < trElementi.length && trElementi[i].tagName == 'TR'; i++) {

            let tdElementi = trElementi[i].childNodes;
            for (let j = 0; j < tdElementi.length && tdElementi[j].tagName == 'TD'; j++) {

                let element = tdElementi[j];
                if (element.innerText == 1 && prviDan == j) { return true; }
            }
        }
        return false;

    }

    function provjeriKrajnjiDan(mjesec) {
        let krajnjiDan = 0;

        {
            let prviDan = (new Date(trenutnaGodina, mjesec)).getDay() - 1;
            if (prviDan < 0) prviDan += 7;

            let testGodina = (mjesec === 11) ? trenutnaGodina + 1 : trenutnaGodina;
            let testMjesec = (mjesec + 1) % 12;

            krajnjiDan = (new Date(testGodina, testMjesec)).getDay() - 2;
            if (krajnjiDan < 0) krajnjiDan += 7;
        }

        let trElementi = tijeloKalendara.childNodes;

        for (let i = 0; i < trElementi.length && trElementi[i].tagName == 'TR'; i++) {

            let tdElementi = trElementi[i].childNodes;
            for (let j = 0; j < tdElementi.length && tdElementi[j].tagName == 'TD'; j++) {

                let element = tdElementi[j];
                if (element.innerText == Kalendar.danaUMjesecu(mjesec, trenutnaGodina) && krajnjiDan == j) { return true; }
            }
        }
        return false;
    }

});
