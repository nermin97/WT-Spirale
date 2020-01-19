let Pozivi = (function() {

    const DEFAULT_PREDAVAC = "Predavac";
    var slike = [];
    var page = 0;

    function ucitajSlikeImpl () {
        $.ajax({
            url: "/Pocetna/slike",
            type: "GET",
            data: {},
            success: function (data, status, settings) {
                slike = data;
                ucitajStranicu()
            },
            error: function (ajaxrequest, ajaxOptions, thrownError) {
              alert("Doslo je do greske tokom ucitavanja slika!");
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

    function ucitajZauzecaImpl() {
        $.ajax({
            url: "/Rezervacije/zauzeca",
            type: "GET",
            data: {},
            success: function (data, status, settings) {
                Kalendar.ucitajPodatke(data.periodicna, data.vanredna);
            },
            error: function (ajaxrequest, ajaxOptions, thrownError) {
              alert("error");
            }
        })
    }

    function rezervisiZauzeceImpl(event) {
        if(confirm('Da li zelite rezervisati ovaj termin?')) {

            let salaElement = document.getElementsByName("sala")[0];
            let sala = salaElement.options[salaElement.selectedIndex].text;
            if (sala == Kalendar.DEFAULT_IZBOR) {
                alert("Izaberite salu!");
                return;
            }
            let checked = document.getElementsByName("periodicna")[0].checked;
            let pocetak = document.getElementsByName("pocetak")[0].value;
            let kraj = document.getElementsByName("kraj")[0].value;
            let celija = event.target;
            console.log(celija.innerText + ' // ' + celija.cellIndex);

            let zauzece = null;
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
                zauzece = new Kalendar.Periodicno(celija.cellIndex, semestar, pocetak, kraj, sala, DEFAULT_PREDAVAC);
            } else { /* datum, pocetak, kraj, naziv, predavac */
                let trenutniMjesec = parseInt(Kalendar.trenutniMjesec) + 1;
                let datumDan = (celija.innerText.length == 1) ? '0' + celija.innerText : celija.innerText;
                let datumMjesec = (trenutniMjesec < 10) ? '0' + trenutniMjesec : trenutniMjesec;
                let datum =  datumDan + '.' + datumMjesec + '.' + Kalendar.trenutnaGodina;
                zauzece = new Kalendar.Vanredno(datum, pocetak, kraj, sala, DEFAULT_PREDAVAC);
            }

            if (mozeSeRezervisati(zauzece)){
                let data = {};
                if (zauzece instanceof Kalendar.Periodicno) {
                    data = { periodicno: zauzece };
                } else {
                    data = { vanredno: zauzece };
                }
                // Send data to server
                $.ajax({
                    url: "/Rezervacije/zauzeca",
                    type: "POST",
                    data: data,
                    success: function (data, status, settings) {
                        if (settings.readyState != 4) {
                            alert(data);
                        }
                        ucitajZauzecaImpl();
                    },
                    error: function (ajaxrequest, ajaxOptions, thrownError) {
                        alert("error");
                    }
                })
            } 
        }
    }

    function mozeSeRezervisati(zauzece) {
        let BreakException = {};
        let zauzeca = Kalendar.dajZauzecaPoSali(zauzece.naziv);
        if (zauzeca != null && zauzeca.length > 0) {
            try {
                zauzeca.forEach(element => {
                    let preklapanjeUSatima = ((element.pocetak <= zauzece.pocetak && element.kraj >= zauzece.kraj) 
                                            || (zauzece.pocetak <= element.pocetak && zauzece.kraj > element.pocetak) 
                                            || (zauzece.pocetak < element.kraj && zauzece.kraj >= element.kraj));
                    if (element instanceof Kalendar.Periodicno) {
                        if (zauzece instanceof Kalendar.Periodicno) { // Ako su oba periodicna
                            if (element.semestar == zauzece.semestar && element.dan == zauzece.dan && preklapanjeUSatima) {
                                alert("Preklapanje termina sa postojecim periodicnim zauzecem!");
                                throw BreakException;
                            }
                        } else { // Ako je element Periodicno a zeli se rezervisati Vanredno zauzece
                            let semestarElement = (element.semestar == Kalendar.ZIMSKI) ? Kalendar.ZIMSKI_SEMESTAR : Kalendar.LJETNI_SEMESTAR;
                            let datumElementi = zauzece.datum.split('.');
                            let datum = new Date(datumElementi[1] + '/' + datumElementi[0] + '/' + datumElementi[2]);
                            let danUSedmici = datum.getDay() - 1;
                            if (danUSedmici < 0) danUSedmici += 7;
    
                            if (semestarElement.includes(parseInt(datumElementi[1]) - 1) && element.dan == danUSedmici & preklapanjeUSatima) {
                                alert("Preklapanje termina sa postojecim periodicnim zauzecem!");
                                throw BreakException;
                            }
                        }
                    } else {
                        if (zauzece instanceof Kalendar.Periodicno) { // Ako je elementVanredno a zeli se rezervisati periodicno
                            let semestarZauzece = (zauzece.semestar == Kalendar.ZIMSKI) ? Kalendar.ZIMSKI_SEMESTAR : Kalendar.LJETNI_SEMESTAR;
                            let datumElementi = element.datum.split('.');
                            let datum = new Date(datumElementi[1] + '/' + datumElementi[0] + '/' + datumElementi[2]);
                            let danUSedmici = datum.getDay() - 1;
                            if (danUSedmici < 0) prviDan += 7;
    
                            if (semestarZauzece.includes(parseInt(datumElementi[1]) - 1) && danUSedmici == zauzece.dan && preklapanjeUSatima) {
                                alert("Preklapanje termina sa postojecim vanrednim zauzecem!");
                                throw BreakException;
                            }
                        } else { // Ako su oba vanredna
                            if (element.datum == zauzece.datum && preklapanjeUSatima) {
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
        return true;;
    }

    return {
        ucitajSlike: ucitajSlikeImpl,
        sljedeca: sljedecaImpl,
        prethodna: prethodnaImpl,
        ucitajZauzeca: ucitajZauzecaImpl,
        rezervisiZauzece: rezervisiZauzeceImpl
    }
} ());