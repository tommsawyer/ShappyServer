'use strict';

var ImageMagick         = require('gm').subClass({ imageMagick: true }),
    fs                  = require('fs'),
    MechanicsController = require('../mechanics_controller');

const THUMBNAIL_WIDTH = 480;

class ImagesController extends MechanicsController {
    /**
     * Генерирует имя файла для превью картинки по пути к полной картинке
     * @param {string} pathToImage путь к полной картинке
     * @returns {string} путь к превью
     */
    static generateThumbnailFileName(pathToImage) {
        var dividedFileName = pathToImage.split('.'),
            fileName        = dividedFileName[0],
            fileExtension   = dividedFileName[1];

        return __dirname +
               '/../public/stocks/' +
               fileName +
               '_thumb.' +
               fileExtension;
    }

    /**
     * Создает превью картинки
     * @param pathToImage путь к полной картинке
     * @returns {Promise} промис, ресолвящийся после сохранения файла картинки
     */
    createThumbnail(pathToImage) {
        var self = this;

        var thumbnailFilename = ImagesController.generateThumbnailFileName(pathToImage),
            fullImageFileName = __dirname + '/../public/stocks/' + pathToImage;

        return new Promise(function(resolve, reject) {
            ImageMagick(fullImageFileName)
                .resize(THUMBNAIL_WIDTH)
                .write(thumbnailFilename, function (err) {
                    if (err) {
                        Shappy.logger.error(err);
                        return reject(err);
                    }

                    Shappy.logger.info('Создал и сохранил тамбнейл для акции ' + self.model._id);
                    resolve();
                });
        })
    }

    /**
     * Физически удаляет картинки с диска
     * @returns {Promise} промис, ресолвящийся после удаления
     */
    removeImages() {
        var fullImagePath = __dirname + '/../public' + this.logo,
            thumbnailPath = __dirname + '/../public' + this.thumb,
            self = this;

        return new Promise(function(resolve, reject) {
            fs.unlink(fullImagePath, (err) => {
                if (err) {
                    return reject(err);
                }

                Shappy.logger.info('Удалил логотип акции ' + self._id);

                fs.unlink(thumbnailPath, (err) => {
                    if (err) {
                        return reject(err);
                    }

                    Shappy.logger.info('Удалил тамбнейл акции ' + self._id);
                    resolve();
                });
            });
        });
    }

    /**
     * Создает картинки по файлу, пришедшему в запросе
     * @param file файл из запроса
     * @returns {Promise} промис, ресолвящийся после сохранения картинок
     */
    createImages(file) {
        var self = this;

        if (!file) {
            this.logo = '';
            this.thumb = '';
            return Promise.reject();
        }

        this.logo = '/stocks/' + file.filename;
        this.thumb = '/stocks/' + file.filename.split('.')[0] + '_thumb.' + file.filename.split('.')[1];

        return this.saveChanges().then(function() {
            return self.createThumbnail(file.filename);
        });
    }
}

module.exports = ImagesController;

