'use strict';

var MechanicsController = require('../mechanics_controller'),
    mongoose            = require('mongoose'),
    StringResources     = require('../../string_resources'),
    QueryBuilder        = require('../../../lib/query_builder'),
    JSONError           = require('../../../lib/json_error');

class UsagesController extends MechanicsController {
    /**
     * Получает количество подписок
     * @returns {Number}
     */
    getNumberOfUses() {
        return this.model.subscribes.reduce((totalUsesAmount, subscribe) => {
            return totalUsesAmount + subscribe.numberOfUses.length;
        }, 0);
    }

    /**
     * Получает количество подписчиков, которые подписывались заново
     * @returns {Number}
     */
    getNumberOfReUses() {
        return this.model.subscribes.filter((subscribe) => {
            return subscribe.numberOfUses.length > 1;
        }).length
    }

    /**
     * Увеличивает количество использований акции по коду
     * @param code активационный код
     * @returns {Promise} промис, ресолвящийся если получилось увеличить, реджектящийся если у этой акции нет этого кода
     */
    incrementNumberOfUses(code) {
        for (var i=0; i < this.model.subscribes.length; i++) {
            if (this.model.subscribes[i].code == code) {
                this.model.subscribes[i].numberOfUses.push(new Date());
                return this.saveChanges();
            }
        }

        var error = new JSONError(StringResources.answers.ERROR, StringResources.errors.NO_SUCH_ACTIVATION_CODE);
        return Promise.reject(error);
    }

    /**
     * Получает пользователя по активационному коду
     * @param code активационный код
     * @returns {Promise} промис, ресолвящийся с моделью пользователя
     */
    getUserByCode(code) {
        var Client   = mongoose.model('Client'),
            clientID = this.getUserIDByCode(code),
            query    = QueryBuilder.entityIdEqualsTo(clientID);

        return new Promise(function(resolve, reject) {
            Client.findOne(query, function(err, client) {
                if (err) return reject(err);

                resolve(client);
            });
        });
    }

    /**
     * Получает айди пользователя по активационному коду
     * @param code активационный код
     * @returns {string} айди пользователя
     */
    getUserIDByCode(code) {
        return this.model.subscribes.filter(subscribe => subscribe.code === code)[0].id;
    }
}

module.exports = UsagesController;
