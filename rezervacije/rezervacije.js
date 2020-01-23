let loadFunkcija = function() {
    let dobaviZauzeca = Pozivi.dobaviZauzeca;
    let dobaviOsoblje = Pozivi.dobaviOsoblje;
    let dobaviSale = Pozivi.dobaviSale;
    
    let kalendarDiv = document.getElementById('kalendarDiv');
    let loader = document.createElement('div');
    let kartica = document.getElementById('kartica');
    kartica.style.display = 'none';
    loader.setAttribute('id', 'loader');
    kalendarDiv.appendChild(loader);
    loader.style.margin = 'auto';
    dobaviSale();
    dobaviOsoblje();
    dobaviZauzeca();

    setInterval(() => {
        let kalendarDiv = document.getElementById('kalendarDiv');
        let loader = document.createElement('div');
        let kartica = document.getElementById('kartica');
        kartica.style.display = 'none';
        loader.setAttribute('id', 'loader');
        kalendarDiv.appendChild(loader);
        loader.style.margin = 'auto';
        
        dobaviSale();
        dobaviOsoblje();
        dobaviZauzeca();
    }, 300000);
}

window.onload = loadFunkcija;


