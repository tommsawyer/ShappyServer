'use strict';

var AuthManager = {
    loadCompanyModel: function(req, res, next) {
        var Company = mongoose.model('Company');

        var token = req.body.token || req.query.token;

        Company.findOne({'token.value': token}, (err, company) => {
            if (err) {
                return next(err);
            }

            if (!company || !token) {
                Shappy.logger.warn('Не найдена компания с токеном ' + token);
                return next();
            }

            if (!company.active){
                Shappy.logger.warn('Запрос от неактивированной компании');
                return next();
            }

            req.company = company;
            next();
        });
    },


    loadClientModel: function(req, res, next) {
        var Client = mongoose.model('Client');

        var token = req.body.token || req.query.token;

        Client.findOne({'token.value': token}, (err, user) => {
            if (err) {
                return next(err);
            }

            if (!user || !token) {
                Shappy.logger.warn('Не найден юзер с токеном ' + token);
                return next();
            }

            req.user = user;
            next();
        });
    },

    mustBeLoggedAsCompany: function(req, res, next){
        if (!req.company){
            return next(new JSONError('error', 'Доступ запрещен', 403));
        }

        next();
    },

    mustBeLoggedAsClient: function(req, res, next){
        if (!req.user){
            return next(new JSONError('error', 'Доступ запрещен', 403));
        }

        next();
    },

    mustBeLoggedAsAnyUserType: function(req, res, next){
        if (!req.company && !req.user){
            return next(new JSONError('error', 'Доступ запрещен', 403));
        }

        next();
    }
};

module.exports = AuthManager;

