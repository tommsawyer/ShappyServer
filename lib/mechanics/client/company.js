'use strict';

var MechanicsController = require('../mechanics_controller'),
    JSONError           = require('../../../lib/json_error'),
    StringResources     = require('../../../lib/string_resources');

class CompaniesController extends MechanicsController {
    /**
     * Проверяет, подписан ли пользователь на компанию
     * @param company модель компании
     * @returns {boolean} true если подписан, false иначе
     */
    isSubscribedTo(company) {
        return this.model.filters.companies.indexOf(company._id.toString()) !== -1;
    }

    /**
     * Подписывается на компанию
     * @param company модель компании
     * @returns {Promise} промис, ресолвящийся после подписки
     */
    subscribeTo(company) {
        var self = this;

        if (this.isSubscribedTo(company)) {
            var error = new JSONError(StringResources.answers.ERROR,
                                      StringResources.errors.CLIENT_ALREADY_SUBSCRIBED_TO_COMPANY);
            return Promise.reject(error);
        }

        this.model.filters.companies.push(company._id);

        return company.subscribesController.addSubscriber(this.model)
            .then(function() {
                Shappy.logger.info('Пользователь ' + self.login +
                    ' подписался на компанию с айди ' + company._id.toString());
                return self.saveChanges();
            });
    }

    /**
     * Отписывается от компании
     * @param company
     * @returns {Promise} промис, ресолвящийся после отписки
     */
    unsubcribeFrom(company) {
        var self = this;

        if (!this.isSubscribedTo(company)) {
            var error = new JSONError(StringResources.answers.ERROR,
                StringResources.errors.CLIENT_NOT_SUBSCRIBED_TO_COMPANY);
            return Promise.reject(error);
        }

        var subscribePosition = this.model.filters.companies.indexOf(company._id);

        this.model.filters.companies.splice(subscribePosition, 1);

        return company.subscribesController.removeSubscriber(this.model)
            .then(function() {
                Shappy.logger.info('Пользователь ' + self.login +
                    ' отписался от компании с айди ' + company._id.toString());
                return self.saveChanges();
            });
    }
}

module.exports = CompaniesController;