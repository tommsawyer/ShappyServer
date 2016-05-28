'use strict';

class MechanicsController {
    constructor(model) {
        this.model = model;
    }

    /**
     * Сохраняет изменения в прикрепрленной к контроллеру модели
     * @returns {Promise} промис, который резолвится с моделью, если все успешно,
     * иначе реджектится с ошибкой
     */
    saveChanges() {
        var self = this;

        return new Promise(function(resolve, reject) {
            self.model.save(function(err) {
                if (err) return reject(err);
                resolve(self.model);
            });
        });
    }
}

module.exports = MechanicsController;