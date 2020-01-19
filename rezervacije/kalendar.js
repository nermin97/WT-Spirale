let Kalendar = (function() {
    const LJETNI = "ljetni";
    const ZIMSKI = "zimski";
    const DEFAULT_IZBOR = "Izaberite salu";
    var periodicnaZauzeca = null;
    var vanrednaZauzeca = null;
    tijeloKalendara = document.getElementById("tijelo-kalendara");
    const ZIMSKI_SEMESTAR = [9, 10, 11, 0];
    const LJETNI_SEMESTAR = [1, 2, 3, 4]
    danas = new Date();
    let trenutnaGodina = danas.getFullYear();
    let trenutniMjesec = danas.getMonth();
    const IMENA_MJESECI = ["Januar", "Februar", "Mart", "April", "Maj", "Juni", "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"];
    let monthAndYear = document.getElementById("monthAndYear");

    function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {
        // Provjera podataka
        if (!mjesec.toString().match(/^(1[0-1]|[0-9])$/g)) { throw "Mjesec je neispravan!"; }
        if (!pocetak.toString().match(/^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/g)) { throw "Pocetak je neispravan!"; }
        if (!kraj.toString().match(/^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/g)) { throw "Kraj je neispravan!"; }

        trenutniMjesec = mjesec;
        let zauzeca = dajZauzecaPoSali(sala);

        let trElementi = kalendarRef.childNodes;
        for (let i = 0; i < trElementi.length && trElementi[i].tagName == 'TR'; i++) {
                        
            let tdElementi = trElementi[i].childNodes;
            for (let j = 0; j < tdElementi.length && tdElementi[j].tagName == 'TD'; j++) {

                let element = tdElementi[j];

                if (element.innerText != '') {

                    // Resetujemo na slobodne
                    element.classList.remove('zauzeta');
                    element.classList.add('slobodna');
                    if (pocetak == kraj) continue;

                    zauzeca.forEach(zauzece => { // Idemo kroz svako zauzece
            
                        // Provjeravamo da li se odabrano vrijeme sijece sa vremenom zauzeca sale
                        let preklapanjeUSatima = ((pocetak <= zauzece.pocetak && kraj >= zauzece.kraj) 
                                            || (zauzece.pocetak <= pocetak && zauzece.kraj > pocetak) 
                                            || (zauzece.pocetak < kraj && zauzece.kraj >= kraj));
                        if (zauzece instanceof Vanredno ) {
                            datumElementi = zauzece.datum.split('.');
                            if (preklapanjeUSatima && dajDatum(zauzece.datum).getDate() == parseInt(element.innerText) && (parseInt(datumElementi[1]) - 1) == trenutniMjesec) {
                                element.classList.remove('slobodna');
                                element.classList.add('zauzeta');
                            }
                        } else if (dajSemestar(zauzece.semestar).includes(mjesec) && j == zauzece.dan && preklapanjeUSatima) {
                            element.classList.remove('slobodna');
                            element.classList.add('zauzeta');
                        }
                        /* if ((zauzece instanceof Periodicno && dajSemestar(zauzece.semestar).includes(mjesec) && j == zauzece.dan)
                            || (zauzece instanceof Vanredno && dajDatum(zauzece.datum).getDate() == parseInt(element.innerText))) {
                            element.classList.remove('slobodna');
                            element.classList.add('zauzeta');
                        }
                        if ((pocetak <= zauzece.pocetak && kraj >= zauzece.kraj) 
                            || (zauzece.pocetak <= pocetak && zauzece.kraj> pocetak) 
                            || (zauzece.pocetak < kraj && zauzece.kraj >= kraj )) { 
                            // Periodicno ili Vanredno?
                            
                        } */
                    })  
                }
            }
        }
    }


    function ucitajPodatkeImpl(redovna, vanredna){
        try {
            periodicnaZauzeca = new Array();
            if (redovna != null) {
                redovna.forEach(element => {
                    periodicnaZauzeca.push(new Periodicno(element.dan, element.semestar, element.pocetak,
                                                        element.kraj, element.naziv, element.predavac))
                });
            }
            vanrednaZauzeca = new Array();
            if (vanredna != null) {
                vanredna.forEach(element => {
                    vanrednaZauzeca.push(new Vanredno(element.datum, element.pocetak, element.kraj,
                                                        element.naziv, element.predavac))
                });
            }
            osvjeziZauzeca();
        } catch (error) {
            periodicnaZauzeca = new Array();
            vanrednaZauzeca = new Array();
            console.log(error);
        }
    }

    function iscrtajKalendarImpl(kalendarRef, mjesec){
        trenutniMjesec = mjesec;
        let prviDan = (new Date(trenutnaGodina, mjesec)).getDay() - 1;
        if (prviDan < 0) prviDan += 7;

        monthAndYear.innerHTML = IMENA_MJESECI[mjesec] + ' ' + trenutnaGodina;

        kalendarRef.innerHTML = "";
        let datum = 1;
        for (let i = 0; i < 6; i++) {
            let red = document.createElement("tr");

            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < prviDan) {
                    celija = document.createElement("td");
                    celija.style.cssText = "border: none"
                    /* textCelije = document.createTextNode("");
                    celija.appendChild(textCelije); */
                    red.appendChild(celija);
                }
                else if (datum > danaUMjesecu(mjesec, trenutnaGodina)) {
                    break;
                }

                else {
                    celija = document.createElement("td");
                    celija.style.cssText = "heigth: 12px; width: 25px"
                    /* textCelije = document.createTextNode(datum); */
                    if (datum === danas.getDate() && trenutnaGodina === danas.getFullYear() && mjesec === danas.getMonth()) {
                        celija.classList.add("bg-info");
                    }
                    
                    cellChild = document.createElement("td");
                    cellChild.style.cssText = "width: 100%"
                    celija.innerText = datum;
                    celija.appendChild(cellChild);
                    celija.classList.add('slobodna');
                    red.appendChild(celija);
                    datum++;
                }


            }

            kalendarRef.appendChild(red);
        }
        if (trenutniMjesec == 11) {
            document.getElementById('next').disabled = true;
        } else {
            document.getElementById('next').disabled = false;
        }
        if (trenutniMjesec == 0) {
            document.getElementById('previous').disabled = true;
        } else {
            document.getElementById('previous').disabled = false;
        }
    }

    function danaUMjesecu(iMonth, iYear) {
        return 32 - new Date(iYear, iMonth, 32).getDate();
    }

    function dajZauzecaPoSali(sala) {
        let zauzeca = new Array();
        if (periodicnaZauzeca != null) {
            periodicnaZauzeca.forEach(element => {
                if(element.naziv == sala) {
                    zauzeca.push(element);
                }
            })
            
        }
        if (vanrednaZauzeca != null) {
            vanrednaZauzeca.forEach(element => {
                if (element.naziv == sala) {
                    zauzeca.push(element);
                }
            })
        }
        return zauzeca;
    }

    class Periodicno {
        constructor (dan, semestar, pocetak, kraj, naziv, predavac) {
            if (!dan.toString().match(/^[0-6]$/g)) { throw "Periodicno: " + "Dan je neispravan!"; }
            if (!semestar.toString().match(/ljetni|zimski$/g)) { throw "Periodicno: " + "Semestar je neispravan!"; }
            if (!pocetak.toString().match(/^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/g)) { throw "Periodicno: " + "Pocetak je neispravan!"; }
            if (!kraj.toString().match(/^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/g)) { throw "Periodicno: " + "Kraj je neispravan!"; }
            this.dan = dan;
            this.semestar = semestar;
            this.pocetak = pocetak;
            this.kraj = kraj;
            this.naziv = naziv;
            this.predavac = predavac;
        }
    }
    
    class Vanredno {
        constructor (datum, pocetak, kraj, naziv, predavac) {
            if (!datum.toString().match(/^(3[01]|[12][0-9]|0[1-9])\.(1[012]|0[1-9])\.((?:19|20)\d{2})\s*$/g)) { throw "Vanredno: " + "Datum je neispravan!" }
            if (!pocetak.toString().match(/^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/g)) { throw "Vanredno: " + "Pocetak je neispravan!"; }
            if (!kraj.toString().match(/^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/g)) { throw "Vanredno: " + "Kraj je neispravan!"; }
            this.datum = datum;
            this.pocetak = pocetak;
            this.kraj = kraj;
            this.naziv = naziv;
            this.predavac = predavac;
        }
    }

    function dajSemestar(semestar) {
        return (semestar == LJETNI) ? LJETNI_SEMESTAR : (semestar == ZIMSKI) ? ZIMSKI_SEMESTAR : null;
    }

    function dajDatum(datum) {
        let datumElementi = datum.split('.');
        return new Date(datumElementi[1] + '/' + datumElementi[0] + '/' + datumElementi[2]);
    }

    return {
        obojiZauzeca: obojiZauzecaImpl,
        ucitajPodatke: ucitajPodatkeImpl,
        iscrtajKalendar: iscrtajKalendarImpl,
        dajZauzecaPoSali: dajZauzecaPoSali,
        danaUMjesecu: danaUMjesecu,
        periodicnaZauzeca: periodicnaZauzeca,
        vanrednaZauzeca: vanrednaZauzeca,
        danaUMjesecu: danaUMjesecu,
        trenutniMjesec: trenutniMjesec,
        trenutnaGodina: trenutnaGodina,
        ZIMSKI_SEMESTAR: ZIMSKI_SEMESTAR,
        LJETNI_SEMESTAR: LJETNI_SEMESTAR,
        ZIMSKI: ZIMSKI,
        LJETNI: LJETNI,
        DEFAULT_IZBOR: DEFAULT_IZBOR,
        Periodicno: Periodicno,
        Vanredno: Vanredno
    }
} ());

function sljedeci() {
    Kalendar.trenutnaGodina = (Kalendar.trenutniMjesec === 11) ? Kalendar.trenutnaGodina + 1 : Kalendar.trenutnaGodina;
    Kalendar.trenutniMjesec = (Kalendar.trenutniMjesec + 1) % 12;
    Kalendar.iscrtajKalendar(document.getElementById("tijelo-kalendara"), Kalendar.trenutniMjesec);
    osvjeziZauzeca();
}

function prethodni() {
    Kalendar.trenutnaGodina = (Kalendar.trenutniMjesec === 0) ? Kalendar.trenutnaGodina - 1 : Kalendar.trenutnaGodina;
    Kalendar.trenutniMjesec = (Kalendar.trenutniMjesec === 0) ? 11 : Kalendar.trenutniMjesec - 1;
    Kalendar.iscrtajKalendar(document.getElementById("tijelo-kalendara"), Kalendar.trenutniMjesec);
    osvjeziZauzeca();
}

function osvjeziZauzeca() {
    let salaElement = document.getElementsByName("sala")[0];
    let sala = salaElement.options[salaElement.selectedIndex].text;
    if (sala == Kalendar.DEFAULT_IZBOR) return;
    let pocetak = document.getElementsByName("pocetak")[0].value;
    let elementKraj = document.getElementsByName("kraj")[0];
    let kraj = elementKraj.value;
    if (pocetak > kraj) {
        elementKraj.value = pocetak;
        kraj = pocetak;
    };

    {
        let trElementi = document.getElementById("tijelo-kalendara").childNodes;
        for (let i = 0; i < trElementi.length && trElementi[i].tagName == 'TR'; i++) {
            let tdElementi = trElementi[i].childNodes;
            for (let j = 0; j < tdElementi.length && tdElementi[j].tagName == 'TD'; j++) {
                let element = tdElementi[j];
                if (element.innerText.length > 0) element.addEventListener('click', Pozivi.rezervisiZauzece);
            }
        }
    }

    Kalendar.obojiZauzeca(tijeloKalendara, Kalendar.trenutniMjesec, sala, pocetak, kraj);
}

document.getElementById('select-sala').addEventListener('change', osvjeziZauzeca);
document.getElementById('vrijeme-pocetka').addEventListener('input', osvjeziZauzeca);
document.getElementById('vrijeme-kraja').addEventListener('input', osvjeziZauzeca);

Kalendar.ucitajPodatke([{
    dan: 4,
    semestar: 'zimski',
    pocetak: '09:00',
    kraj: '10:00',
    naziv: '0-01',
    predavac: 'Neki predavac'
}, {
    dan: 5,
    semestar: 'zimski',
    pocetak: '10:00',
    kraj: '11:00',
    naziv: '0-02',
    predavac: 'Neki predavac'
}, {
    dan: 2,
    semestar: 'zimski',
    pocetak: '06:00',
    kraj: '23:00',
    naziv: '0-01',
    predavac: 'Neki predavac'
}
], null);
Kalendar.iscrtajKalendar(tijeloKalendara, Kalendar.trenutniMjesec);


/* 
Elementi redovnih zauzeca imaju sljedeci oblik:
{
    dan: broj od 0-6 koji redom predstavlja ponedeljak do petka,
    semestar: “zimski” ili “ljetni”,
    pocetak: string u formatu “hh:mm”,
    kraj: string u formatu “hh:mm”,
    naziv: string,
    predavac: string
} 

Elementi vanrednih zauzeća imaju sljedeći oblik:
{
    datum: string u formatu “dd.mm.yyyy”,
    pocetak: string u formatu “hh:mm”,
    kraj: string u formatu “hh:mm”,
    naziv: string,
    predavac: string
}

*/
    