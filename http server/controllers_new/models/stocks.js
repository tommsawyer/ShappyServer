'use strict';

var ObjectID = require('mongodb').ObjectId,
    mongoose = require('mongoose'),
    QueryBuilder = require('../../../lib/query_builder'),
    JSONError = require('../../../lib/json_error'),
    StringResources = require('../../../lib/string_resources'),
    Stock    = mongoose.model('Stock');

class StockController {
    static getInfoAboutStock(req, res, next) {
        var stockID = Shappy.utils.tryConvertToMongoID(req.query.id);

        if (stockID === null) {
            var error = new JSONError(StringResources.answers.STOCK_INFO,
                StringResources.errors.NO_SUCH_STOCK, 404);
            return next(error);
        }

        var query = QueryBuilder.entityIdEqualsTo(stockID);

        Stock.findOneAndPopulate(query)
            .then(function(stock) {
                var clientID, stockJSON;

                if (!stock) {
                    var error = new JSONError(StringResources.answers.STOCK_INFO,
                        StringResources.errors.NO_SUCH_STOCK, 404);
                    return next(error);
                }

                // если информацию о акции запросил обычный пользователь,
                // то увеличим счетчик просмотров акции
                if (req.user) {
                    stock.viewsController.incrementNumberOfViews();
                    clientID = req.user._id;
                }

                stockJSON = stock.toJSON(clientID);

                res.JSONAnswer(StringResources.answers.STOCK_INFO, stockJSON);
            })
            .catch(next);
    }

    static createNewStock(req, res, next) {
        var categoryID = Shappy.utils.tryConvertToMongoID(req.body.category),
            startDate  = Shappy.utils.tryParseDate(req.body.startDate),
            endDate    = Shappy.utils.tryParseDate(req.body.endDate);

        var isCorrectDates = (startDate &&
                              endDate &&
                              Shappy.utils.isCurrentDateBetween(startDate, endDate));

        if (!isCorrectDates) {
            var datesError = new JSONError(StringResources.answers.ERROR,
                StringResources.errors.STOCK_DATES_INCORRECT);
            return next(datesError);
        }

        if (categoryID === null) {
            var categoryError = new JSONError(StringResources.answers.ERROR,
                StringResources.errors.NO_SUCH_CATEGORY, 404);
            return next(categoryError);
        }

        if (!req.file) {
            var imageError = new JSONError(StringResources.answers.ERROR,
                StringResources.errors.IMAGE_NOT_PRESENT_IN_REQUEST);
            return next(imageError);
        }

        var stockParameters = {
            name:        req.body.name,
            category:    categoryID,
            description: req.body.description,
            company:     req.company._id,
            startDate:   startDate,
            endDate:     endDate
        };

        var stock = new Stock(stockParameters);
        stock.imagesController.createImages(req.file);

        stock.promisedSave().then(function(stock) {
            var stockInfo = {
                id: stock._id,
                logo: stock.logo
            };

            res.JSONAnswer(StringResources.answers.STOCK, stockInfo);
        }).catch(next);
    }

    static editStock (req, res, next) {

    }

    static removeStock (req, res, next) {

    }

    static getStocksOfCurrentCompany (req, res, next) {

    }

    static subscribeClientToStock (req, res, next) {

    }

    static unsubscribeClientFromStock (req, res, next) {

    }

    static getClientFeed (req, res, next) {

    }

    static getAllStocks (req, res, next) {

    }
}

module.exports = StockController;