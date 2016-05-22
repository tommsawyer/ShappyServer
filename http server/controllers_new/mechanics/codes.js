'use strict';

var JSONError       = require('../../../lib/json_error'),
    mongoose        = require('mongoose'),
    StringResources = require('../../../utils/string_resources'),
    Stock           = mongoose.model('Stock');

class CodesController {
    static checkActivationCode(req, res, next) {
        var activationCode = req.query.code,
            activationInfo = {};

        Stock.getStockBySubcriptionCode(activationCode)
            .then(function(stock) {
                if (!stock.isOwnedBy(req.company._id)) {
                    var rightsError = new JSONError(StringResources.answers.ERROR,
                        StringResources.answers.NOT_ENOUGH_RIGHTS, 403);
                    return next(rightsError);
                }

                activationInfo.stock = stock.toJSON();

                return stock.getClientOfActivationCode(activationCode)
            })
            .then(function(client) {
                activationInfo.user = client.toJSON();

                res.JSONAnswer(StringResources.answers.CHECK, activationInfo)
            })
            .catch(next);
    }

    static applyActivationCode(req, res, next) {
        var activationCode = req.body.code;

        Stock.getStockBySubcriptionCode(activationCode)
            .then(function(stock) {
                if (!stock.isOwnedBy(req.company._id)) {
                    var rightsError = new JSONError(StringResources.answers.ERROR,
                        StringResources.answers.NOT_ENOUGH_RIGHTS, 403);
                    return next(rightsError);
                }

                return stock.viewsController.incrementNumberOfUses(code)
            })
            .then(function() {
               res.JSONAnswer(StringResources.answers.APPLY, StringResources.answers.OK);
            })
            .catch(next);
    }
}

module.exports = CodesController;