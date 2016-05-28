'use strict';

var StringResources     = require('../../string_resources'),
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

    /**
     * Сохраняет путь к логотипу картинки этой компании
     * @param filename название картинки
     * @returns {Promise} промис, ресолвящийся после сохранения
     */
    saveImagePath(filename) {
        this.logo = '/companies' + filename;
        return this.saveChanges();
    }
}

module.exports = ImagesController;