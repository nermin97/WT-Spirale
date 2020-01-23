let loadFunkcija = function() {
    let dobaviSale = Pozivi.dobaviSale;
    
    prikaziLoader();
    dobaviSale();

    setInterval(() => {
        prikaziLoader();
        dobaviSale();
    }, 300000);
}

window.onload = loadFunkcija;


