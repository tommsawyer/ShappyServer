'use strict';

class ConfigManager {
    constructor() {
        this.loadConfigs();
    }

    loadConfigs() {
        this.loadMailConfig();
        this.loadCommonConfig();
    }

    loadMailConfig() {
        var mail           = require('../configs/mail.json'),
            requiredFields = ['login', 'password', 'href', 'from'];

        this._checkRequiredFields(requiredFields, mail);

        this.mail = mail;
    }

    loadCommonConfig() {
        var common         = require('../configs/common.json'),
            requiredFields = ['port', 'mongooseUrl',
                              'prodDatabaseName', 'testDatabaseName'];

        this._checkRequiredFields(requiredFields, common);

        this.common = common;
    }

    /**
     * Проверяет, все ли поля в объекте конфига заполнены
     * @param fields {[string]} массив с названиями полей
     * @param obj объект конфига
     * @private
     */
    _checkRequiredFields(fields, obj) {
        fields.forEach(function(field) {
            var fieldIsNotEmpty = obj[field] && obj[field].toString().length > 0;

            if (!fieldIsNotEmpty) {
                throw new Error('В конфиге не заполнено поле ' + field);
            }
        });
    }
}

module.exports = ConfigManager;