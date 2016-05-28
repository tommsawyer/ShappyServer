'use strict';

var JSONError       = require('../../../lib/json_error'),
    StringResources = require('../../../utils/string_resources'),
    QueryBuilder    = require('../../../lib/query_builder'),
    mongoose        = require('mongoose'),
    Stock           = mongoose.model('Stock');

class StatsController {
    static stocksPerDate(req, res, next) {
        var query = QueryBuilder.fieldEqualsTo('company', req.company._id);

        Stock.findAndPopulate(query)
            .then(function(stocks) {
                if (stocks.length === 0) {
                    return res.JSONAnswer(StringResources.answers.STOCKS_PER_DATE, {});
                }

                var dates = {};

                Stock.arrayToJSON(stocks).forEach((stock) => {
                    stock.subscribes.forEach((subscr) => {
                        var date = subscr.date.toDateString();
                        dates[date] = dates[date] + 1 || 1;
                    });
                });

                res.JSONAnswer(StringResources.answers.STOCKS_PER_DATE, dates);
            })
            .catch(next);
    }

    static usersPerStock(req, res, next) {
        var stockID = Shappy.utils.tryConvertToMongoID(req.query.id);

        if (stockID === null) {
            var error = new JSONError(StringResources.answers.USERS_PER_STOCK,
                                      StringResources.errors.NO_SUCH_STOCK, 404);
            return next(error);
        }

        var query = QueryBuilder.entityIdEqualsTo(stockID);

        Stock.findOneAndPopulate(query)
            .then(function(stock) {
                if (!stock) {
                    var error = new JSONError(StringResources.answers.USERS_PER_STOCK,
                        StringResources.errors.NO_SUCH_STOCK, 404);
                    return next(error);
                }

                var stats = {};

                stats[stock.name] = stock.subcribesController.getDates().map(function(date) {
                    return date.toDateString();
                });

                res.JSONAnswer(StringResources.answers.USERS_PER_STOCK, stats);
            })
            .catch(next);
    }

    static countPerStock(req, res, next) {
        var query = QueryBuilder.fieldEqualsTo('company', req.company._id);

        Stock.findAndPopulate(query)
            .then(function(stocks) {
                if (stock.length === 0) {
                    return res.JSONAnswer(StringResources.answers.COUNT_PER_STOCK, {});
                }

                var stats = {};

                stocks.forEach(function(stock) {
                    stats[stock.name] = stock.subcribesController.getDates().map(function(date) {
                        return date.toDateString();
                    });
                });

                res.JSONAnswer(StringResources.answers.COUNT_PER_STOCK, stats);
            })
            .catch(next);
    }

    static stockInfo(req, res, next) {
        var stockID = Shappy.utils.tryConvertToMongoID(req.query.id);

        if (stockID === null) {
            var error = new JSONError(StringResources.answers.STOCK_INFO,
                StringResources.errors.NO_SUCH_STOCK, 404);
            return next(error);
        }

        var query = QueryBuilder.entityIdEqualsTo(stockID);

        Stock.findOneAndPopulate(query)
            .then(function(stock) {
                if (!stock) {
                    var error = new JSONError(StringResources.answers.STOCK_INFO,
                        StringResources.errors.NO_SUCH_STOCK, 404);
                    return next(error);
                }

                var stockInfo = {
                    viewsInFeed: stock.viewsInFeed || 0,
                    views: stock.views || 0,
                    subscribes: stock.subscribesController.getSubscribesCount(),
                    uses: stock.subscribesController.getNumberOfUses(),
                    reuses: stock.subscribesController.getNumberOfReUses()
                };

                res.JSONAnswer(StringResources.answers.STOCK_INFO, stockInfo);
            })
            .catch(next);
    }

    static numberOfUses(req, res, next) {
        var query = QueryBuilder.fieldEqualsTo('company', req.company._id);

        Stock.findAndPopulate(query)
            .then(function(stocks) {
                if (stocks.length === 0) {
                    return res.JSONAnswer(StringResources.answers.NUMBER_OF_USES, {});
                }

                var stats = {};

                stocks.forEach((stock) => {
                    stats[stock.name] = [];
                    stock.subscribes.forEach((subscribe) => {
                        stats[stock.name] = stats[stock.name].concat(subscribe.numberOfUses.map(date => date.toDateString()));
                    });
                });

                res.JSONAnswer(StringResources.answers.NUMBER_OF_USES, stats);

            })
            .catch(err);
    }
}

module.exports = StatsController;