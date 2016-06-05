'use strict';

var MechanicsController = require('../mechanics_controller'),
    SHA256              = require('crypto-js/sha256');

class ActivationController extends MechanicsController {
    /**
     * Генерирует активационный хеш для компании
     * @returns {string} хешированная строка
     */
    generateActivationHash() {
        Shappy.logger.info('Генерирую хэш для активации для компании ' + this.model.login);

        var stringForGeneratingHash = this.model.name + this.model.login + new Date().toDateString();

        return SHA256(stringForGeneratingHash).toString();
    }

    /**
     * Устанавливает активационный хеш и сохраняет компанию
     * @param hash строка с активационным хешем
     * @returns {Promise} промис, резовлящийся после сохранения компании
     */
    setActivationHash(hash) {
        this.model.active = false;
        this.model.activationHash = hash;


        return this.saveChanges()
            .then(function (model) {
                Shappy.logger.info('Установил компании ' + model.login + ' хэш для активации (' + hash + ')');
                return model;
            });
    }

    /**
     * Активирует компанию и сохраняет ее
     * @returns {Promise} промис, резовлящийся после сохранения компании
     */
    activate() {
        var self = this;

        this.model.activationHash = null;
        this.model.active = true;

        return this.saveChanges()
            .then(function (model) {
                Shappy.logger.info('Компания с id ' + self._id + ' активировала е-майл')
                return model;
            });
    }
}

module.exports = ActivationController;
