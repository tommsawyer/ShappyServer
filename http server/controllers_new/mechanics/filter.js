'use strict';

var JSONError       = require('../../../lib/json_error'),
    StringResources = require('../../../lib/string_resources'),
    mongoose        = require('mongoose'),
    Stock           = mongoose.model('Stock'),
    QueryBuilder    = require('../../../lib/query_builder');

class FilterController {
    static complexStockSearch(req, res, next) {

    }

    static findStockByCompany(req, res, next) {
        var companyID = Shappy.utils.tryConvertToMongoID(req.query.companyID);

        if (companyID === null) {
            var error = new JSONError(StringResources.answers.ERROR,
                                      StringResources.errors.NO_SUCH_COMPANY, 404);
            return next(error);
        }

        var query = QueryBuilder.fieldEqualsTo('company', companyID);

        Stock.findAndPopulate(query)
            .then(function(stocks) {
                stocks.forEach(stock => stock.viewsController.incrementFeedView());

                res.JSONAnswer(StringResources.answers.STOCKS,
                               stocks.map(stock => stock.toJSON(req.user._id)));
            })
            .catch(next);
    }

    static findStocksBy(req, res, next) {

    }

    static findStocksByKeyWord(req, res, next) {
        var nameContainsSearchWord = '.*' + req.query.searchword + '.*',
            query = QueryBuilder.fieldLikeRegExp('name', nameContainsSearchWord);

        Stock.findAndPopulate(query)
            .then(function(stocks) {
                stocks.forEach(stock => stock.viewsController.incrementFeedView());

                res.JSONAnswer(StringResources.answers.STOCKS,
                    stocks.map(stock => stock.toJSON(req.user._id)));
            })
            .catch(next);
    }

    static findSubscribedStocks(req, res, next) {
        var query = QueryBuilder.some(
            QueryBuilder.valueInArray('company',  req.user.filters.companies),
            QueryBuilder.valueInArray('category', req.user.filters.categories)
        );

        Stock.findAndPopulate(query)
            .then(function(stocks) {
                stocks.forEach(function(stock) {
                    stock.viewsController.incrementFeedViews();
                });

                var stocksJSON = stocks.map(stock => stock.toJSON());

                res.JSONAnswer(StringResources.answers.SUBSCRIPTIONS, stocksJSON);
            })
            .catch(next);
    }

    static findFriendsStocks(req, res, next) {

    }
}

module.exports = FilterController;