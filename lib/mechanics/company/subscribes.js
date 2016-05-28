'use strict';

var MechanicsController = require('../mechanics_controller'),
    JSONError           = require('../../../lib/json_error'),
    StringResources     = require('../../../utils/string_resources');

class SubscribesController extends MechanicsController {
    /**
     * Проверяет, подписан ли на компанию пользователь по его айди
     * @param userID айди пользователя
     * @returns {boolean} true если подписан, false иначе
     */
    isSubscribed(userID) {
        return this.model.subscribers.indexOf(userID) !== -1;
    }

    /**
     * Добавляет нового подписчика к компании
     * @param subscriberID айди подписчика
     * @returns {Promise} промис, ресолвящийся после добавления
     */
    addSubscriber(subscriberID) {
        if (this.isSubscribed(subscriberID)) {
            return Promise.reject(new JSONError(StringResources.answers.ERROR,
                                                StringResources.errors.CLIENT_ALREADY_IN_SUBCRIBERS));
        }

        this.model.subscribers.push(subscriberID);
        Shappy.logger.info('Добавил пользователя ' + subscriberID.toString() + ' к подписчикам компании ' + this.model._id.toString());
        return this.saveChanges();
    }

    /**
     * Удаляет подписчика от компании
     * @param subscriberID айди пользователя
     * @returns {Promise} промис, ресолвящийся после удаления
     */
    removeSubscriber(subscriberID) {
        if (!this.isSubscribed(subscriberID)) {
            return Promise.reject(new JSONError(StringResources.answers.ERROR,
                StringResources.errors.CLIENT_NOT_IN_SUBSRIBES));
        }


        this.subscribers.splice(self.subscribers.indexOf(subscriberID), 1);
        Shappy.logger.info('Удалил пользователя ' + subscriberID.toString() +
            ' из подписчиков компании ' + this.model._id.toString());
        return this.saveChanges();
    }
}

module.exports = SubscribesController;
