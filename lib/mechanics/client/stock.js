'use strict';

var ObjectID            = require('mongodb').ObjectID,
    JSONError           = require('../../../lib/json_error'),
    QueryBulder         = require('../../../lib/query_builder'),
    mongoose            = require('mongoose'),
    MechanicsController = require('../mechanics_controller'),
    StringResources     = require('../../../lib/string_resources');

class StocksController extends MechanicsController {
    /**
     * Получает все акции, на которые подписан пользователь
     * @returns {Promise} промис, который резолвится с массивом акций, или реджектится если была ошибка
     */
    getSubscribedStocks() {
        var Stock = mongoose.model('Stock');

        // если подписок нет - ресолвимся с пустым массивом
        if (this.model.subscribes.stocks.length == 0)
            return Promise.resolve([]);

        var query = QueryBulder.valueInArray('_id', this.model.subscribes.stock);

        return Stock.findAndPopulate(query);
    }

    /**
     * Подписывается на акцию по ее айди
     * @param id - айди акции
     * @returns {Promise} промис, который резолвится если успешно подписался, иначе реджект с ошибкой
     */
    subscribeTo(id) {
        var Stock = mongoose.model('Stock'),
            self  = this;

        // если передана строка с айди, преобразуем ее к ObjectID
        if (typeof id === 'string') {
            id = new ObjectID(id);
        }

        // если уже подписаны, то реджектимся с ошибкой
        if (this.isSubscribedTo(id)) {
            return Promise.reject(new JSONError('error', StringResources.errors.ALREADY_SUBSCRIBED_TO_STOCK));
        }

        return new Promise(function(resolve, reject) {
            Stock.findOne({_id: id}, (err, stock) => {
                if (err) return reject(err);

                if (!stock) {
                    return reject(new JSONError('error', StringResources.errors.NO_SUCH_STOCK));
                }

                self.model.stocks.push(id);

                resolve(stock);
            });
        })
        // сохраняем акцию
        .then((stock) => { return stock.promisedSave() })
        // сохраняем клиента
        .then(self.saveChanges);
    }

    unsubscribeFrom(id) {

    }

    /**
     * Проверяет, подписан ли клиент на акцию по айди
     * @param id - айди акции
     * @returns {boolean} - true если подписан, false иначе
     */
    isSubscribedTo(id) {
        return this.model.stocks.indexOf(id) !== -1;
    }
}

module.exports = StocksController;
/*
ClientSchema.methods.getSubscribitions = function (callback) {
    var Stock = mongoose.model('Stock');
    var subscribitions = this.stocks.map((id) => {
        return new ObjectID(id)
    });
    var self = this;

    if (subscribitions.length == 0) {
        callback(null, []);
        return;
    }

    Stock.findAndPopulate({_id: {$in: subscribitions}}, (err, stocks) => {
        if (err) {
            callback(err);
            return;
        }

        callback(null, Stock.arrayToJSON(stocks, self._id));
    });
};

ClientSchema.methods.subscribe = function (id, callback) {
    var Stock = mongoose.model('Stock');

    Stock.findOne({_id: new ObjectID(id)}, (err, stock) => {
        if (err) {
            callback(err);
        }

        if (!stock) {
            logger.warn('Не существует акции с айди ' + id);
            callback(new JSONError('error', 'Нет такой акции'));
            return;
        }

        logger.info('Нашел акцию с айди ' + stock._id.toString());

        var id = stock._id.toString();
        var subscribes = this.stocks;
        var self = this;

        if (subscribes.indexOf(id) != -1) {
            logger.warn('Попытка подписаться на акцию, которая уже в подписках. Айди ' + id);
            callback(new JSONError('error', 'Вы уже подписаны на эту акцию'));
            return;
        }

        subscribes.push(id);
        this.stocks = subscribes;

        stock.addSubscriber(this._id.toString(), (err, subscription) => {
            if (err) return callback(err);
            logger.info('Юзер ' + self.login + ' подписался на акцию ' + id);
            callback(null, subscription);
        });
    });
};

ClientSchema.methods.unsubscribe = function (id) {
    var stockPosition = this.stocks.indexOf(id.toString());

    if (stockPosition == -1) {
        return false;
    }

    this.stocks.splice(stockPosition, 1);
    logger.info('Пользователь ' + this.login + ' отписался от акции ' + id);
    this.save();
};
*/