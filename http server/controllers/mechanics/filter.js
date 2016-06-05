'use strict';

var JSONError       = require('../../../lib/json_error'),
    StringResources = require('../../../lib/string_resources'),
    mongoose        = require('mongoose'),
    Stock           = mongoose.model('Stock'),
    Client          = mongoose.model('Client'),
    QueryBuilder    = require('../../../lib/query_builder');

class FilterController {
    static buildQueryForSearch(req) {
        var companyEqualsRequestCompany = req.query.companyID
            ? QueryBuilder.fieldEqualsTo('company', req.query.companyID)
            : null;

        var categoryEqualsRequestCompany = req.query.category
            ? QueryBuilder.fieldEqualsTo('category', req.query.category)
            : null;

        var searchByKeyWord = req.query.searchword
            ? QueryBuilder.some(
                QueryBuilder.fieldLikeRegExp('name', '.*' + query.searchword + '.*'),
                QueryBuilder.fieldLikeRegExp('description', '.*' + query.searchword + '.*')
            )
            : null;

        var queries = [companyEqualsRequestCompany, categoryEqualsRequestCompany, searchByKeyWord]
            .map(query => query !== null);

        return QueryBuilder.all.apply(null, queries);
    }

    static complexStockSearch(req, res, next) {
        var query = FilterController.buildQueryForSearch(req);

        Stock.find(query, function(err, stocks) {
            if (err) return next(err);

            stocks.forEach(function(stock) {
                stock.viewsController.incrementFeedViews();
            });

            var stocksJSON = stocks.map(stock => stock.toJSON());

            res.JSONAnswer(StringResources.answers.STOCKS, stocksJSON);
        });
    }

    static findStocksByCompany(req, res, next) {
        var companyID = Shappy.utils.tryConvertToMongoID(req.query.companyID);

        if (companyID === null) {
            var error = new JSONError(StringResources.answers.ERROR,
                                      StringResources.errors.NO_SUCH_COMPANY, 404);
            return next(error);
        }

        var query = QueryBuilder.fieldEqualsTo('company', companyID);

        Stock.findAndPopulate(query)
            .then(function(stocks) {
                stocks.forEach(stock => stock.viewsController.incrementFeedViews());

                res.JSONAnswer(StringResources.answers.STOCKS,
                               stocks.map(stock => stock.toJSON(req.user._id)));
            })
            .catch(next);
    }

    static findStocksByCategory(req, res, next) {
        var categoryID = Shappy.utils.tryConvertToMongoID(req.query.id);

        if (categoryID === null) {
            var error = new JSONError(StringResources.answers.ERROR,
                StringResources.errors.NO_SUCH_CATEGORY, 404);
            return next(error);
        }

        var query = QueryBuilder.fieldEqualsTo('category', categoryID);

        Stock.findAndPopulate(query)
            .then(function(stocks) {
                stocks.forEach(stock => stock.viewsController.incrementFeedViews());

                res.JSONAnswer(StringResources.answers.STOCKS,
                    stocks.map(stock => stock.toJSON(req.user._id)));
            })
            .catch(next);
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
        var query = QueryBuilder.valueInArray('_id', req.user.friends);

        Client.find(query, function(err, userFriends) {
            if (err) return next(err);

            var stocksIds = userFriends
                .map(friend => friend.stocks)
                // собрать акции всех друзей в один массив
                .reduce(function(stocksArray, friendStocksArray) {
                    return stocksArray.concat(friendStocksArray);
                }, [])
                // взять только уникальные
                .filter((stockID, index, stocksArray) => {return stocksArray.indexOf(stockID) === index});

            var query = QueryBuilder.valueInArray('_id', stocksIds);

            Stock.findAndPopulate(query)
                .then(function(stocks) {
                    stocks.forEach(function(stock) {
                        stock.viewsController.incrementFeedViews();
                    });

                    var stocksJSON = stocks.map(stock => stock.toJSON());
                    res.JSONAnswer(StringResources.answers.FRIENDS_FEED, stocksJSON)
                })
                .catch(next)
        });
    }
}

module.exports = FilterController;