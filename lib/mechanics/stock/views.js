'use strict';

var MechanicsController = require('../mechanics_controller');

class ViewsController extends MechanicsController {
    /**
     * Увеличивает количетсво просмотров у акции
     * @returns {Promise} промис, который резолвится после сохранения модели
     */
    incrementViews() {
        this.model.views = this.model.views + 1 || 1;
        Shappy.logger.info('Увеличиваю счетчик просмотров у акции');
        return this.saveChanges();
    }

    /**
     * Увеличивает количетсво просмотров у акции
     * @returns {Promise} промис, который резолвится после сохранения модели
     */
    incrementFeedViews() {
        this.model.viewsInFeed = this.model.viewsInFeed + 1 || 1;
        Shappy.logger.info('Увеличиваю счетчик просмотров у акции в ленте');
        return this.saveChanges();
    }
}

module.exports = ViewsController;