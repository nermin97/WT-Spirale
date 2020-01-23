const app = require('./app');
const init = require('./database/inicijalizacija');

init.inicijaliziraj();

module.exports = {
    app: app,
    init: init
};