// Import the dependencies for testing
const app = require("../app");
const chai = require("chai");
const chaiHttp = require("chai-http");
const init = require('../database/inicijalizacija');
const db = require('../database/db');

var sale = [];
var osobe = [];


// Configure chai
const { expect } = chai;
chai.use(chaiHttp);
chai.should();

describe("/osoblje", () => {

    beforeEach((done) => {
        db.sequelize.sync({force: true}).then(function() {
            init.inicijalizacija().then(function() {
                chai.request(app).get('/Rezervacije/sale').end((err, res) => {
                    expect(res).to.have.status(200);
                    sale = res.body;
                    chai.request(app).get('/Rezervacije/osoblje').end((err, res) => {
                        expect(res).to.have.status(200);
                        osobe = res.body;
                        done();
                    });
                });
            });
        });
    })

    it("(GET) Should return an array of person rezervations with location", (done) => {
        chai.request(app).get('/osoblje').end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(3);
            done();
        });
    });

    it("(GET) Should have person: Test Test inside the hall 1-15 at the moment", (done) => {

        let sala = sale.filter(s => s.naziv == '1-15')[0];
        let osoba = osobe.filter(o => (o.ime == 'Test' && o.prezime == 'Test' && o.uloga == 'asistent'))[0];
        danas = new Date();
        datumDan = (danas.getDate() > 9) ? danas.getDate() : '0' + danas.getDate();
        datumMjesec = ((danas.getMonth() + 1) > 9) ? danas.getMonth() + 1 : '0' + (danas.getMonth() + 1);
        datum = datumDan + '.' + datumMjesec + '.' + danas.getFullYear();
        chai.request(app).post('/zauzeca')
        .send({
            termin: {
                redovni: false,
                dan: null,
                datum: datum,
                semestar: null,
                pocetak: '00:00',
                kraj: '23:59'
            },
            sala: sala,
            osoba: osoba
        }).end((err, res) => {
            chai.request(app).get('/osoblje').end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.filter(o => { return o.osoba.id == osoba.id; })[0].trenutnaSala.naziv).to.equals(sala.naziv);
                done();
            });
        });         
    });
        
});


describe('/zauzeca',  () => {

    beforeEach((done) => {
        db.sequelize.sync({force: true}).then(function() {
            init.inicijalizacija().then(function() {
                chai.request(app).get('/Rezervacije/sale').end((err, res) => {
                    expect(res).to.have.status(200);
                    sale = res.body;
                    chai.request(app).get('/Rezervacije/osoblje').end((err, res) => {
                        expect(res).to.have.status(200);
                        osobe = res.body;
                        done();
                    });
                });
            });
        });
    });

    it("(GET) Should return an array of occupancy", (done) => {
        
        chai.request(app).get('/zauzeca').end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.redovna.length).to.equal(res.body.vanredna.length);
            done();
        });
    });

    it('(GET) Should update an array of occupancy with new added one', (done) => {
        let sala = sale.filter(s => s.naziv == '1-15')[0];
        let osoba = osobe.filter(o => (o.ime == 'Drugi' && o.prezime == 'Neko' && o.uloga == 'asistent'))[0];
        chai.request(app).post('/zauzeca')
        .send({
            termin: {
                redovni: true,
                dan: (new Date().getDay() + 6) % 7,
                datum: null,
                semestar: 'zimski',
                pocetak: '00:00',
                kraj: '23:59'
            },
            sala: sala,
            osoba: osoba
        }).end((err, res) => {
            chai.request(app).get('/osoblje').end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.filter(o => o.osoba.id == osoba.id)[0].trenutnaSala.naziv).to.equal(sala.naziv);
                done();
            });
        });
    });
    
    it('(POST) Should create a new reservation for marginal case of beginning time', (done) => {
        let sala = sale.filter(s => s.naziv == '1-11')[0];
        let osoba = osobe.filter(o => (o.ime == 'Drugi' && o.prezime == 'Neko' && o.uloga == 'asistent'))[0];
        chai.request(app).post('/zauzeca')
        .send({
            termin: {
                redovni: true,
                dan: 0,
                datum: null,
                semestar: 'zimski',
                pocetak: '14:00',
                kraj: '15:00'
            },
            sala: sala,
            osoba: osoba
        }).end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.pocetak).to.equals('14:00');
            expect(res.body.kraj).to.equals('15:00');
            done();
        });
        
    });

    it('(POST) Should create a new reservation for marginal case of ending time', (done) => {
        let sala = sale.filter(s => s.naziv == '1-11')[0];
        let osoba = osobe.filter(o => (o.ime == 'Drugi' && o.prezime == 'Neko' && o.uloga == 'asistent'))[0];
        chai.request(app).post('/zauzeca')
        .send({
            termin: {
                redovni: true,
                dan: 0,
                datum: null,
                semestar: 'zimski',
                pocetak: '12:00',
                kraj: '13:00'
            },
            sala: sala,
            osoba: osoba
        }).end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.pocetak).to.equals('12:00');
            expect(res.body.kraj).to.equals('13:00');
            done();
        });
        
    });

    it('(POST) Should return 400 BadRequest because the person has a regular reservation that overlaps with time of this reservaton', (done) => {
        let sala = sale.filter(s => s.naziv == '1-15')[0];
        let osoba = osobe.filter(o => (o.ime == 'Test' && o.prezime == 'Test' && o.uloga == 'asistent'))[0];
        chai.request(app).post('/zauzeca')
        .send({
            termin: {
                redovni: false,
                dan: null,
                datum: '06.01.2020',
                semestar: null,
                pocetak: '12:30',
                kraj: '13:30'
            },
            sala: sala,
            osoba: osoba
        }).end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.text).to.equal('"Osoba: Test Test ima Redovnu rezervaciju sale: 1-11, Ponedjeljkom, U terminu: 13:00:00 - 14:00:00 koja se preklapa sa trazenom rezervacijom!"');
            done();  
        });
    });

    it('(POST) Should return 400 BadRequest because the person has a once time reservation that overlaps with time of this reservation', (done) => {
        let sala = sale.filter(s => s.naziv == '1-15')[0];
        let osoba = osobe.filter(o => (o.ime == 'Neko' && o.prezime == 'Nekić' && o.uloga == 'profesor'))[0];
        chai.request(app).post('/zauzeca')
        .send({
            termin: {
                redovni: true,
                dan: 2,
                datum: null,
                semestar: 'zimski',
                pocetak: '12:30',
                kraj: '13:30'
            },
            sala: sala,
            osoba: osoba
        }).end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.text).to.equal('"Osoba: Neko Nekić ima Vanrednu rezervaciju sale: 1-11, Datuma: 01.01.2020, U terminu: 12:00:00 - 13:00:00 koja se preklapa sa trazenom rezervacijom!"');
            done();
        });
    });
});

describe('/Rezervacije/sale', () => {

    beforeEach((done) => {
        db.sequelize.sync({force: true}).then(function() {
            init.inicijalizacija().then(function() {
                done();
            });
        });
    });

    it('(GET) Should return a list of halls, containing the inital 2 elements', (done) => {
        chai.request(app).get('/Rezervacije/sale').end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.length).to.equal(2);
            done();
        });
    });
});

describe('/Rezervacije/osoblje', () => {

    beforeEach((done) => {
        db.sequelize.sync({force: true}).then(function() {
            init.inicijalizacija().then(function() {
                done();
            });
        });
    });

    it('(GET) Should return a list of people, containing the initial 3 elements', (done) => {
        chai.request(app).get('/Rezervacije/osoblje').end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.length).to.equal(3);
            done();
        });
    });
});