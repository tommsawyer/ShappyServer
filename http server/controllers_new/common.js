'use strict';

var JsonError = require('../../lib/json_error');

class CommonController {
    static fieldsMustPresent(fieldsArray) {
        return function (req, res, next) {
            var emptyFields = [],
            queryParams = req.method === 'POST' ? req.body : req.query;

            fieldsArray.forEach(function (field) {
                if (!queryParams[field]) {
                    emptyFields.push(field);
                }
            });

            var isAllFieldsPresent = (emptyFields.length === 0);

            if (!isAllFieldsPresent) {
                emptyFields = emptyFields.join(' ');
                return next(new JsonError('bad request', 'В запросе нет полей: ' + emptyFields));
            }

            next();
        };
    }

    static loginAndPasswordMustBeCorrect(req, res, next) {
        var loginRegExp    = /[a-zA-Z]{5,}/,
            passwordRegExp = /.{5,20}/;

        if (!req.body.login.match(loginRegExp)) {
            return next(new JSONError('error', 'Некорректный логин'));
        }

        if (!req.body.password.match(passwordRegExp)) {
            return next(new JSONError('error', 'Некорректный пароль'));
        }

        next();
    }


    static loadCompanyModel(req, res, next) {
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

            if (!company.active) {
                Shappy.logger.warn('Запрос от неактивированной компании');
                return next();
            }

            req.company = company;
            next();
        });
    }

    static loadClientModel (req, res, next) {
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
    }

    static mustBeLoggedAsCompany (req, res, next) {
        if (!req.company) {
            return next(new JSONError('error', 'Доступ запрещен', 403));
        }

        next();
    }

    static mustBeLoggedAsClient (req, res, next) {
        if (!req.user) {
            return next(new JSONError('error', 'Доступ запрещен', 403));
        }

        next();
    }

    static mustBeLoggedAsAnyUserType (req, res, next) {
        if (!req.company && !req.user) {
            return next(new JSONError('error', 'Доступ запрещен', 403));
        }

        next();
    }

}


module.exports = CommonController;

