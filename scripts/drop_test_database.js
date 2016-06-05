var mongoose = require('mongoose'),
    Shappy   = require('../lib/shappy');

const testDatabaseConnectionUrl = Shappy.config.common.mongooseUrl +
        Shappy.config.common.testDatabaseName;

function promisedDrop(collection) {
    return new Promise(function(resolve, reject) {
        collection.drop(function(err) {
            if (err) return reject(err);
            resolve();
        });
    });
}

mongoose.connect(testDatabaseConnectionUrl, function(err) {
    console.log('Соединился с тестовой базой данных');

    console.log(mongoose.connection.collections);
});