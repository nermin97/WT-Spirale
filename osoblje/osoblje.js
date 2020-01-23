


window.onload = function() {
    let load = Pozivi.dobaviOsobeLokacije;

    load();
    setInterval(() => {
        load();
    }, 30000);
}

