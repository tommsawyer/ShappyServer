'use strict';

var JSONError       = require('../../../lib/json_error'),
    StringResources = require('../../../lib/string_resources'),
    QueryBuilder    = require('../../../lib/query_builder'),
    mongoose        = require('mongoose'),
    Company         = mongoose.model('Company');

class CompaniesController {
    static getCurrentCompanyInfo (req, res, next) {
        Shappy.logger.info('Присылаю информацию о компании ' + req.company._id);
        res.JSONAnswer(StringResources.answers.COMPANY, req.company.toJSON());
    }

    static getInfoAboutCompany (req, res, next) {
        var companyID = Shappy.utils.tryConvertToMongoID(req.query.id);

        if (companyID === null) {
            var error = new JSONError(StringResources.answers.ERROR,
                                      StringResources.errors.NO_SUCH_COMPANY, 404);
            return next(error);
        }

        var query = QueryBuilder.entityIdEqualsTo(companyID);

        Company.findOne(query, function(err, company) {
            if (!company) {
                var error = new JSONError(StringResources.answers.ERROR,
                    StringResources.errors.NO_SUCH_COMPANY, 404);
                return next(error);
            }

            res.JSONAnswer(StringResources.answers.COMPANY, company.toJSON());
        });
    }

    static getAllCompanies (req, res, next) {
        Company.find({}, (err, companies) => {
            if (err) {
                return next(err);
            }

            var comp = companies.map((company) => {return company.toJSON()});

            Shappy.logger.info('Отправляю все компании пользователю. Всего ' + comp.length);
            res.JSONAnswer(StringResources.answers.COMPANIES, comp);
        });
    }

    static subscribeClientToCompany (req, res, next) {
        var companyID = Shappy.utils.tryConvertToMongoID(req.body.id);

        if (companyID === null) {
            var error = new JSONError(StringResources.answers.ERROR,
                                      StringResources.errors.NO_SUCH_COMPANY, 404);
            return next(error);
        }

        var query = QueryBuilder.entityIdEqualsTo(companyID);

        Company.findOne(query, function(err, company) {
            if (err) return next(err);

            if (!company) {
                var error = new JSONError(StringResources.answers.ERROR,
                    StringResources.errors.NO_SUCH_COMPANY, 404);
                return next(error);
            }

            req.user.companiesController.subscribeTo(company)
                .then(function() {
                    res.JSONAnswer(StringResources.answers.COMPANY, StringResources.answers.SUCCESS);
                })
                .catch(next);
        });
    }


    static unsubscribeClientFromCompany (req, res, next) {
        var companyID = Shappy.utils.tryConvertToMongoID(req.body.id);

        if (companyID === null) {
            var error = new JSONError(StringResources.answers.ERROR,
                StringResources.errors.NO_SUCH_COMPANY, 404);
            return next(error);
        }

        var query = QueryBuilder.entityIdEqualsTo(companyID);

        Company.findOne(query, function(err, company) {
            if (err) return next(err);

            if (!company) {
                var error = new JSONError(StringResources.answers.ERROR,
                    StringResources.errors.NO_SUCH_COMPANY, 404);
                return next(error);
            }

            req.user.companiesController.unsubcribeFrom(company)
                .then(function() {
                    res.JSONAnswer(StringResources.answers.COMPANY, StringResources.answers.SUCCESS);
                })
                .catch(next);
        });

    }

    static findCompaniesByFilter (req, res, next) {
        //TODO: доделать
    }

    static getClientSubscribedCompanies (req, res, next) {
        var query = QueryBuilder.valueInArray('_id', req.user.filters.companies);

        Company.find(query, (err, companies) => {
            if (err) return next(err);

            res.JSONAnswer(StringResources.answers.COMPANIES,
                companies.map(company => company.toJSON()));
        });
    }
}

module.exports = CompaniesController;