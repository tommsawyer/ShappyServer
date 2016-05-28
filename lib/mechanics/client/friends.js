'use strict';

var mongoose            = require('mongoose'),
    StringResources     = require('../../string_resources'),
    MechanicsController = require('../mechanics_controller'),
    JsonError           = require('../../json_error'),
    ObjectID            = require('mongodb').ObjectID;

class FriendsController extends MechanicsController {
    /**
     * Добавление нового пользователя в друзья
     * @param {ObjectID} clientID - айди добавляемого пользователя
     * @returns {Promise} - промис, который резолвится, если добавление прошло успешно, иначе реджектится с ошибкой
     */
    addFriendByID(clientID) {
        if (this.isInFriends(clientID)) {
            return Promise.reject(new JsonError('error', StringResources.errors.CLIENT_ALREADY_IN_FRIENDS));
        }

        this.model.friends.push(clientID);
        return this.saveChanges();
    }

    /**
     * Удаление пользователя из друзей
     * @param {ObjectID} clientID - айди удаляемого пользователя
     * @returns {Promise} - промис, который резолвится, если удаление прошло успешно, иначе реджектится с ошибкой
     */
    removeFriendByID(clientID) {
        if (!this.isInFriends(clientID)) {
            return Promise.reject(new JsonError('error', StringResources.errors.CLIENT_NOT_IN_FRIENDS));
        }

        var position = this.model.friends.indexOf(clientID);
        this.model.friends.splice(position, 1);

        return this.saveChanges();
    }

    /**
     * Получает модели всех друзей
     * @returns {Promise} - промис, который резолвится с массивом моделей друзей если все успешно, иначе реджект с ошибкой
     */
    getAllFriends() {
        var friendsIDs = this.model.friends.map(id => new ObjectID(id)),
            Client     = mongoose.model('Client');

        var allWhereIdInFriendsIDs = {
            _id: {$in: friendsIDs}
        };

        return new Promise(function(resolve, reject) {
            Client.find(allWhereIdInFriendsIDs, function(err, clients) {
                if (err) return reject(err);

                resolve(clients);
            });
        });
    }

    /**
     * Проверяет, в друзьях ли пользователь по айди
     * @param {ObjectID} clientID
     * @returns {boolean} true если этот пользователь в друзьях, false иначе
     */
    isInFriends(clientID) {
        return (this.model.friends.indexOf(clientID) !== -1);
    }
}

module.exports = FriendsController;
