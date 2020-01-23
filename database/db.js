const Sequelize = require('sequelize');
const sequelize = new Sequelize('DBWT19', 'root', 'root', { 
    host: '127.0.0.1',
    dialect: 'mysql',
    logging: false
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import modela
db.osoblje = sequelize.import('./../modeli/osoblje.js');
db.rezervacija = sequelize.import('./../modeli/rezervacija.js');
db.termin = sequelize.import('./../modeli/termin.js');
db.sala = sequelize.import('./../modeli/sala.js');

// Relacije
//Sala - jedan na jedan - Osoblje
db.sala.belongsTo(db.osoblje, {as: 'osoba', foreignKey: 'zaduzenaOsoba'});
//Osoblje - jedan na više - Rezervacija
db.osoblje.hasMany(db.rezervacija, {foreignKey: 'osoba'});
//Rezervacija - jedan na jedan - Termin
db.termin.hasOne(db.rezervacija, {foreignKey: 'termin'});
//Rezervacija - više na jedan - Sala
db.sala.hasMany(db.rezervacija, {foreignKey: 'sala'});


module.exports = db;


