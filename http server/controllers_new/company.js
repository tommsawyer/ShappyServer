'use strict';

var mongoose        = require('mongoose'),
    JSONError       = require('../../lib/json_error'),
    ObjectID        = require('mongodb').ObjectId,
    Company         = mongoose.model('Company'),
    Category        = mongoose.model('Category'),
    QueryBuilder    = require('../../lib/query_builder'),
    StringResources = require('../../lib/string_resources');

class CompanyController {
    static loginMustBeFree(req, res, next) {
        var query = QueryBuilder.fieldEqualsTo('login', req.body.login);

        Company.findOne(query, function(err, company) {
            if (err) return next(err);

            if (company) {
                var error = new JSONError(StringResources.answers.ERROR,
                    StringResources.errors.USERNAME_ALREADY_TAKEN);
                return next(error);
            }

            next();
        })
    }

    static registerNewCompany(req, res, next) {
        if (!req.file) {
            return next(new JSONError(StringResources.answers.REGISTER,
                StringResources.errors.IMAGE_NOT_PRESENT_IN_REQUEST));
        }

        var companyParams = {
            login: req.body.login,
            category: req.body.category,
            password: req.body.password,
            email: req.body.email,
            name: req.body.name,
            INN: req.body.INN,
            OGRN: req.body.OGRN,
            active: false,
            logo: '/companies/' + req.file.filename
        };

        var company = new Company(companyParams);

        Company.injectControllers(company);
        company.mailController.sendActivationEmail();

        var activationHash = company.activationController.generateActivationHash();

        company.activationController.setActivationHash(activationHash)
            .then(function() {
                Shappy.logger.info('Зарегистрировал новую компанию с логином ' + company.login);
                res.JSONAnswer(StringResources.answers.REGISTER,
                    StringResources.answers.SUCCESS);
            })
            .catch(next);
    }

    static authorizeCompany(req, res, next) {
        var query = QueryBuilder.fieldEqualsTo('login', req.body.login);

        Company.findOne(query, function(err, company) {
            if (err) return next(err);

            if (!company) {
                var error = new JSONError(StringResources.answers.ERROR,
                    StringResources.errors.NO_SUCH_COMPANY);
                return next(error);
            }

            if (!company.checkPassword(req.body.password)) {
                var incorrectPasswordError = new JSONError(StringResources.answers.ERROR,
                    StringResources.errors.INCORRECT_PASSWORD);
                return next(incorrectPasswordError);
            }

            if (!company.active) {
                Shappy.logger.info('Компания не активирована ' + req.body.login);
                return next(new JSONError(StringResources.answers.UNACTIVATED, company._id.toString(), 403));
            }

            var token = company.getToken();

            Shappy.logger.info('Авторизовалась компания ' + req.body.login);
            res.JSONAnswer('token', token);
        });
    }

    static resendCompanyActivationEmail(req, res, next) {
        //TODO: переписать!
        try {
            var companyID = new ObjectID(req.body.id);
        } catch (e) {
            return next(new JSONError('error', 'Нет такой компании', 404));
        }

        Company.findOne({_id: companyID}, (err, company) => {
            if (err) return next(err);

            if (!company)
                return next(new JSONError('error', 'Нет такой компании', 404));

            if (!company.active) {
                company.mailController.sendActivationEmail();
                res.JSONAnswer('resend', 'success');
            } else {
                return next(new JSONError('error', 'Эта компания уже активирована'));
            }

        });
    }

    static tryActivateCompany(req, res, next) {
        var query = QueryBuilder.fieldEqualsTo('activationHash', req.query.hash);

        Company.findOne(query, function(err, company) {
            if (!company) {
                var notFoundError = new JSONError(StringResources.answers.ERROR,
                            StringResources.errors.NO_SUCH_COMPANY, 404);
                return next(notFoundError);
            }

            company.activationController.activate()
                .then(function() {
                    res.redirect(Shappy.config.common.verifyRedirectUrl + company.getToken())
                })
                .catch(next)
        });
    }
}

module.exports = CompanyController;

