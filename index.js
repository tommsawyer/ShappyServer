// записываем общие утилиты в глобальный неймспейс
global.Shappy = require('./lib/shappy');

var models   = require('./models'),
    Server   = require('./http server/server'),
    mongoose = require('mongoose');

const mongooseConnectionUrl = Shappy.config.common.mongooseUrl +
                              Shappy.config.common.prodDatabaseName;

mongoose.connect(mongooseConnectionUrl, function() {
    Shappy.logger.info('Соединился с БД, адрес ' + mongooseConnectionUrl);

    var server = new Server(Shappy.config.common.port);
    server.run()
        .then(function() {
            Shappy.logger.info('Сервер запущен на порте ' + server.port);
        })
        .catch(function(err) {
            Shappy.logger.info('Невозможно запустить сервер! ' + err.message);
        });
});
