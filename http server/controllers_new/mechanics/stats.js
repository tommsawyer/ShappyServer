'use strict';


class StatsController {
    static stocksPerDate(req, res, next) {
        req.company.getStocks().then(function(stocks) {
            stocks.forEach(function(stock) {
                ()
            });
        });
    }

    static usersPerStock(req, res, next) {

    }

    static countPerStock(req, res, next) {

    }

    static stockInfo(req, res, next) {

    }

    static numberOfUses(req, res, next) {

    }
}

module.exports = StatsController;