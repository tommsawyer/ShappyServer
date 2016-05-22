'use strict';

var StringResources     = require('../../../utils/string_resources'),
    MechanicsController = require('../mechanics_controller');

class ImagesController extends MechanicsController {
    /**
     * Проверяет, есть ли в запросе файл логотипа компании
     * @param request объект запроса
     * @returns {boolean} true если файл существует, false иначе
     */
    isFilePresentInRequest(request) {
        return !!request.file;
    }
}

module.exports = ImagesController;