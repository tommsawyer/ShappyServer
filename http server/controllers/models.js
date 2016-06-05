'use strict';

class ModelsController {
    static loadCategoryFromField(field) {
        return function(req, res, next) {
            //TODO: добавить поиск категории
            req.body[field] = '5752af2e920bb2725f05a927';
            next();
        }
    }
}

module.exports = ModelsController;
