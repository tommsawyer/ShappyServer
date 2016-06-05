'use strict';

var JSONError       = require('../../../lib/json_error'),
    mongoose        = require('mongoose'),
    QueryBuilder    = require('../../../lib/query_builder'),
    StringResources = require('../../../lib/string_resources'),
    Stock           = mongoose.model('Stock');

class CodesController {
    static checkActivationCode(req, res, next) {
        var activationCode = req.query.code,
            activationInfo = {};

        var query = QueryBuilder.findInArrayField('subscribes', QueryBuilder.fieldEqualsTo('code', activationCode));

        Stock.findOneAndPopulate(query)
            .then(function(stock) {
                if (!stock.isOwnedBy(req.company._id)) {
                    var rightsError = new JSONError(StringResources.answers.ERROR,
                        StringResources.answers.NOT_ENOUGH_RIGHTS, 403);
                    return next(rightsError);
                }

                activationInfo.stock = stock.toJSON();

                return stock.usagesController.getUserByCode(activationCode);
            })
            .then(function(client) {
                activationInfo.user = client.toJSON();

                res.JSONAnswer(StringResources.answers.CHECK, activationInfo)
            })
            .catch(next);
    }

    static applyActivationCode(req, res, next) {
        var activationCode = req.body.code,
            query = QueryBuilder.findInArrayField('subscribes', QueryBuilder.fieldEqualsTo('code', activationCode));

        Stock.findOneAndPopulate(query)
            .then(function(stock) {
                if (!stock.isOwnedBy(req.company._id)) {
                    var rightsError = new JSONError(StringResources.answers.ERROR,
                        StringResources.errors.NOT_ENOUGH_RIGHTS, 403);
                    return next(rightsError);
                }

                return stock.usagesController.incrementNumberOfUses(code);
            })
            .then(function() {
               res.JSONAnswer(StringResources.answers.APPLY, StringResources.answers.OK);
            })
            .catch(next);
    }
}

module.exports = CodesController;