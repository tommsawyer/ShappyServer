'use strict';

var MechanicsController = require('../mechanics_controller'),
    StringResources     = require('../../string_resources'),
    JSONError           = require('../../../lib/json_error'),
    mongoose            = require('mongoose');

class SubscribeController extends MechanicsController {
    /**
     * Генерирует объект подписки для пользователя
     * @param userID айди пользователя
     * @returns {{id: *, date: Date, code: string, numberOfUses: number}}
     */
    static generateSubscription(userID) {
        // код подписки - случайное десятизначное число в строковом представлении
        var code = Math.round(Math.random() * 10e9).toString();

        Shappy.logger.info('Сгенерировал код подписки на акцию: ' + code);

        return {
            id: userID,
            date: new Date(),
            code: code,
            numberOfUses: 0
        }
    }

    /**
     * Получает количество подписок на эту акцию
     * @returns {Number} количетсво подписок
     */
    getSubscribesCount() {
        return this.model.subscribes.length;
    }

    /**
     * Получает массив с датами подписок на эту акцию
     * @returns {Array} даты подписок
     */
    getSubscriptionDates() {
        return this.model.subscribes.map(function(subscribe) {
            return subscribe.date;
        });
    }

    /**
     * Получает массив с айди подписчиков на эту акцию
     * @returns {Array} массив с айди
     */
    getSubscribersIDs() {
        return this.model.subscribes.map(function(subscribe) {
            return subscribe.id;
        });
    }

    /**
     * Проверяет, подписан ли на эту акцию пользователь
     * @param userID айди пользователя
     * @returns {boolean} true если подписан, false иначе
     */
    isSubscribed(userID) {
        var subscribersIDs = this.getSubscribersIDs();

        return (subscribersIDs.indexOf(userID.toString()) !== -1);
    }

    /**
     * Получает активационный код для пользователя
     * @param userID айди пользователя
     * @returns {Number} активационный код или null если пользователь не подписан
     */
    getUserSubscriptionCode(userID) {
        var position = this.getSubscribersIDs()
            .map(id => id.toString())
            .indexOf(userID.toString());

        if (position === -1) return null;

        return this.model.subsribes[pos].code;
    }

    /**
     * Добавляет нового подписчика к этой акции
     * @param userID айди пользователя-подписчика
     * @returns {Promise} промис, ресолвящийся если добавление прошло успешно, иначе реджектящийся с ошибкой
     */
    addSubscriber(userID) {
        var self = this,
            ArchivedSubscription = mongoose.model('ArchivedSubcription');

        if (this.isSubscribed(userID)) {
            return Promise.reject(new JSONError(StringResources.answers.ERROR,
                                                StringResources.answers.ALREADY_SUBSCRIBED_TO_STOCK));
        }

        return ArchivedSubscription.lookForPreviousSubscriptions(userID, this.model._id)
            .then(function(archivedSubscriptions) {
                if (archivedSubscriptions.length === 0) {
                    Shappy.logger.info('Предыдущих подписок не найдено. Создаю новую');
                    return SubscribeController.generateSubscription(userID);
                } else {
                    Shappy.logger.info('Найдены предыдущие подписки. Восстанавливаю из архива данные');
                    var newestSubscription = ArchivedSubscription.newest(archivedSubscriptions);
                    return {
                        id: userID,
                        date: new Date(),
                        numberOfUses: newestSubscription.numberOfUses,
                        code: newestSubscription.code
                    };
                }
            })
            .then(function(subscription) {
                this.model.subscribes.push(subscription);

                return self.saveChanges().then(function() {
                    return subscription;
                });
            });
    }

    /**
     * Отписывает подписчика от этой акции
     * @param userID айди отписывающегося пользователя
     * @returns {Promise} промис, который ресолвится если все успешно, реджектится с ошибкой иначе
     */
    removeSubscriber(userID) {
        var self = this;

        var userPositionInSubscribes = this.getSubscribersIDs()
            .map(id => id.toString())
            .indexOf(userID.toString());

        if (userPositionInSubscribes === -1) {
            var error = new JSONError(StringResources.answers.ERROR,
                                      StringResources.errors.CLIENT_NOT_SUBSCRIBED_TO_STOCK);
            return Promise.reject(error);
        }

        var ArchivedSubscription = mongoose.model('ArchivedSubscription');

        return ArchivedSubscription.archive(this.model.company, this.model._id,
                                     this.model.subscribes[userPositionInSubscribes])
            .then(function() {
                Shappy.logger.info('Удаляю подписчика от акции ' + self.model._id);
                self.model.subscribes.splice(userPositionInSubscribes, 1);

                return self.saveChanges();
            })
    }
}

module.exports = SubscribeController;
