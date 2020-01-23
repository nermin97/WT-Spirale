
let Pozivi = (function() {

    var slike = [];
    var page = 0;

    function dobaviSlikeImpl () {
        $.ajax({
            url: "/Pocetna/slike",
            type: "GET",
            data: {},
            success: function (data, status, settings) {
                slike = data;
                ucitajStranicu()
            },
            error: function (ajaxrequest, ajaxOptions, thrownError) {
                console.log(ajaxrequest.responseText);
            }
        })
    }

    function ucitajStranicu() {
        let sadrzaj = document.getElementById('sadrzaj');
        if (slike.length > page * 3) {
            let djeca = sadrzaj.getElementsByTagName('img');
            for (let i = page * 3; i < (page * 3 + 3); i++) {
                let slika = djeca[i % 3];
                if (i < slike.length) {
                    slika.src = slike[i];
                    slika.style.cssText = "display: inherit"
                } else {
                    slika.style.cssText = "display: none";
                }
            }
        }
        if (page * 3 + 3 >= slike.length) {
            document.getElementById("sljedeca").disabled = true;
        } else {
            document.getElementById("sljedeca").disabled = false;
        }
        if (page == 0) {
            document.getElementById("prethodna").disabled = true;
        } else {
            document.getElementById("prethodna").disabled = false;
        }
    }

    function sljedecaImpl() {
        if (page * 3 + 3 < slike.length) {
            page = page + 1;
            ucitajStranicu();
        }
    }
    
    function prethodnaImpl() {
        if (page > 0) {
            page = page - 1;
            ucitajStranicu();
        }
    }

    function dobaviZauzecaImpl() {
        $.ajax({
            url: "/zauzeca",
            type: "GET",
            data: {},
            success: function (data, status, settings) {
                Kalendar.ucitajPodatke(data.redovna, data.vanredna);
                let loader = document.getElementById('loader');
                loader.parentNode.removeChild(loader);
                let kartica = document.getElementById('kartica');
                kartica.style.display = 'flex';
            },
            error: function (ajaxrequest, ajaxOptions, thrownError) {
                console.log(ajaxrequest.responseText);
                let loader = document.getElementById('loader');
                loader.parentNode.removeChild(loader);
                let kartica = document.getElementById('kartica');
                kartica.style.display = 'flex';
            }
        });
    }

    function dobaviOsobljeImpl() {
        $.ajax({
            url: '/Rezervacije/osoblje',
            type: 'GET',
            data: {},
            success: function (data, status, settings) {
                Kalendar.ucitajOsoblje(data);
            },
            error: function (ajaxrequest, ajaxOptions, thrownError) {
                console.log(ajaxrequest.responseText);
            }
        });
    }

    function dobaviSaleImpl() {
        $.ajax({
            url: '/Rezervacije/sale',
            type: 'GET',
            data: {},
            success: function (data, status, settings) {
                Kalendar.ucitajSale(data);
                osvjeziZauzeca();
            },
            error: function (ajaxrequest, ajaxOptions, thrownError) {
                console.log(ajaxrequest.responseText);
            }
        });
    }

    function rezervisiZauzeceImpl(event) {
        if(confirm('Da li zelite rezervisati ovaj termin?')) {

            let salaElement = document.getElementsByName("sala")[0];
            let osobljeElement = document.getElementsByName('osoblje')[0];
            if (salaElement.options[salaElement.selectedIndex].value == -1 || osobljeElement.options[osobljeElement.selectedIndex].value == -1) {
                console.log("Greska!");
                return;
            }
            let sala = Kalendar.listaSala[salaElement.selectedIndex];
            let osoba = Kalendar.listaOsoblja[osobljeElement.selectedIndex];
            
            let checked = document.getElementsByName("periodicna")[0].checked;
            let pocetak = document.getElementsByName("pocetak")[0].value;
            let kraj = document.getElementsByName("kraj")[0].value;
            let celija = event.target;
            if (celija.children.length == 0 && celija.parentNode.tagName == 'TD') celija = celija.parentNode;

            let zauzece = null;
            let osobljeSelect = document.getElementById('osoblje-select');
            if (osobljeSelect.options.length == 0 || osobljeSelect.options[0].value == -1) {
                alert("Trenutno nema osoblja!");
                return;
            }
            if (checked) {
                let semestar = null;
                if (Kalendar.LJETNI_SEMESTAR.includes(Kalendar.trenutniMjesec)) {
                    semestar = Kalendar.LJETNI;
                } else if (Kalendar.ZIMSKI_SEMESTAR.includes(Kalendar.trenutniMjesec)) {
                    semestar = Kalendar.ZIMSKI;
                } else {
                    alert("Mjesec ne ulazi ni u jedan semestar!");
                    return;
                } /* dan, semestar, pocetak, kraj, naziv, predavac */
                zauzece = {
                    termin: {
                        redovni: true,
                        dan: celija.cellIndex,
                        datum: null, 
                        semestar: semestar,
                        pocetak: pocetak,
                        kraj: kraj
                    }, 
                    sala: sala,
                    osoba: osoba
                }
                //zauzece = new Kalendar.Periodicno(celija.cellIndex, semestar, pocetak, kraj, sala, osobljeSelect.options[osobljeSelect.selectedIndex].value);
            } else { /* datum, pocetak, kraj, naziv, predavac */
                let trenutniMjesec = parseInt(Kalendar.trenutniMjesec) + 1;
                let datumDan = (celija.innerText.length == 1) ? '0' + celija.innerText : celija.innerText;
                let datumMjesec = (trenutniMjesec < 10) ? '0' + trenutniMjesec : trenutniMjesec;
                let datum =  datumDan + '.' + datumMjesec + '.' + Kalendar.trenutnaGodina;
                zauzece = {
                    termin: {
                        redovni: false,
                        dan: null,
                        datum: datum, 
                        semestar: null,
                        pocetak: pocetak,
                        kraj: kraj
                    }, 
                    sala: sala,
                    osoba: osoba
                }
                //zauzece = new Kalendar.Vanredno(datum, pocetak, kraj, sala, osobljeSelect.options[osobljeSelect.selectedIndex].value);
            }

            if (mozeSeRezervisati(zauzece)){
                let kalendarDiv = document.getElementById('kalendarDiv');
                let loader = document.createElement('div');
                let kartica = document.getElementById('kartica');
                kartica.style.display = 'none';
                loader.setAttribute('id', 'loader');
                kalendarDiv.appendChild(loader);
                loader.style.margin = 'auto';
                // Send data to server

                $.ajax({
                    url: "/zauzeca",
                    type: "POST",
                    data: zauzece,
                    success: function (data, status, settings) {
                        dobaviZauzecaImpl();
                    },
                    error: function (ajaxrequest, ajaxOptions, thrownError) {
                        if (ajaxrequest.readyState == 4) alert(ajaxrequest.responseText)
                        console.log(ajaxrequest.responseText);
                        let loader = document.getElementById('loader');
                        loader.parentNode.removeChild(loader);
                        let kartica = document.getElementById('kartica');
                        kartica.style.display = 'flex';
                    }
                })
            } 
        }
    }

    function mozeSeRezervisati(zauzece) {
        let BreakException = {};
        let zauzeca = Kalendar.dajZauzecaPoSali(zauzece.sala.naziv);
        if (zauzeca != null && zauzeca.length > 0) {
            try {
                zauzeca.forEach(element => {
                    let preklapanjeUSatima = ((element.pocetak <= zauzece.termin.pocetak && element.kraj >= zauzece.termin.kraj) 
                                            || (zauzece.termin.pocetak <= element.pocetak && zauzece.termin.kraj > element.pocetak) 
                                            || (zauzece.termin.pocetak < element.kraj && zauzece.termin.kraj >= element.kraj));
                    if (element instanceof Kalendar.Periodicno) {
                        if (zauzece.termin.redovni) { // Ako su oba redovna
                            if (element.semestar == zauzece.termin.semestar && element.dan == zauzece.termin.dan && preklapanjeUSatima) {
                                alert("Preklapanje termina sa postojecim periodicnim zauzecem!");
                                throw BreakException;
                            }
                        } else { // Ako je element Periodicno a zeli se rezervisati Vanredno zauzece
                            let semestarElement = (element.semestar == Kalendar.ZIMSKI) ? Kalendar.ZIMSKI_SEMESTAR : Kalendar.LJETNI_SEMESTAR;
                            let datumElementi = zauzece.termin.datum.split('.');
                            let datum = new Date(datumElementi[1] + '/' + datumElementi[0] + '/' + datumElementi[2]);
                            let danUSedmici = datum.getDay() - 1;
                            if (danUSedmici < 0) danUSedmici += 7;
    
                            if (semestarElement.includes(parseInt(datumElementi[1]) - 1) && element.dan == danUSedmici & preklapanjeUSatima) {
                                alert("Preklapanje termina sa postojecim periodicnim zauzecem!");
                                throw BreakException;
                            }
                        }
                    } else {
                        if (zauzece.termin.redovni) { // Ako je elementVanredno a zeli se rezervisati periodicno
                            let semestarZauzece = (zauzece.termin.semestar == Kalendar.ZIMSKI) ? Kalendar.ZIMSKI_SEMESTAR : Kalendar.LJETNI_SEMESTAR;
                            let datumElementi = element.datum.split('.');
                            let datum = new Date(datumElementi[1] + '/' + datumElementi[0] + '/' + datumElementi[2]);
                            let danUSedmici = datum.getDay() - 1;
                            if (danUSedmici < 0) prviDan += 7;
    
                            if (semestarZauzece.includes(parseInt(datumElementi[1]) - 1) && danUSedmici == zauzece.termin.dan && preklapanjeUSatima) {
                                alert("Preklapanje termina sa postojecim vanrednim zauzecem!");
                                throw BreakException;
                            }
                        } else { // Ako su oba vanredna
                            if (element.datum == zauzece.termin.datum && preklapanjeUSatima) {
                                alert("Preklapanje termina sa postojecim vanrednim zauzecem!")
                                throw BreakException;
                            }
                        }
                    }
                })
            } catch (e) {
                if (e != BreakException) throw e;
                return false;
            }
        }
        return true;
    }

    function dobaviOsobeLokacijeImpl() {
        $.ajax({
            url: '/osoblje',
            type: 'GET',
            data: {},
            success: function (data, status, settings) {
                let lista = document.getElementById('lista-osoba');
                if (lista.children.length > 0) lista.innerHTML = '';
                if (data.length == 0) {
                    let item = document.createElement('li');
                    let text = document.createTextNode('Prazno!')
                    item.appendChild(text);
                    lista.appendChild(item);
                }
                data.forEach(element => {
                    let item = document.createElement('li');
                    let text;
                    if (element.trenutnaSala == null && element.trenutniTermin == null) {
                        text = document.createTextNode(element.osoba.ime + ' ' + element.osoba.prezime + ' se nalazi u svojoj kancelariji');
                    }
                    else {
                        text = document.createTextNode(element.osoba.ime + ' ' + element.osoba.prezime + ' se nalazi u Sali: ' + element.trenutnaSala.naziv + ' do ' + element.trenutniTermin.kraj + 'h');
                    } 
                    item.appendChild(text);
                    lista.appendChild(item);
                });
            },
            error: function (ajaxrequest, ajaxOptions, thrownError) {
              console.log("Error kod /Osobe/osobe get");
            }
        });
    }

    return {
        dobaviSlike: dobaviSlikeImpl,
        dobaviOsoblje: dobaviOsobljeImpl,
        dobaviSale: dobaviSaleImpl,
        dobaviOsobeLokacije: dobaviOsobeLokacijeImpl,
        sljedeca: sljedecaImpl,
        prethodna: prethodnaImpl,
        dobaviZauzeca: dobaviZauzecaImpl,
        rezervisiZauzece: rezervisiZauzeceImpl
    }
} ());