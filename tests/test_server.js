global.Shappy = require('../lib/shappy');
Shappy.logger.setSilent(true);

var mongoose = require('mongoose'),
    models   = require('../models'),
    Server   = require('../http server/server.js');

const testDatabaseConnectionUrl = Shappy.config.common.mongooseUrl +
    Shappy.config.common.testDatabaseName;

mongoose.connect(testDatabaseConnectionUrl, function(){
    console.log('Соединился с БД, адрес ' + testDatabaseConnectionUrl);
});

var server = new Server(8080);
server.initializeExpress();

module.exports = server.app;