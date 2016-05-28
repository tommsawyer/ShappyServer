var mongoose  = require('mongoose'),
    JSONError = require('../../lib/json_error'),
    ObjectID  = require('mongodb').ObjectId,
    Company   = mongoose.model('Company'),
    Category  = mongoose.model('Category'),
    StringResources = require('../../lib/string_resources');

var registerNewCompany = function(req, res, next) {

    //TODO при регистрации компании нет ее контроллера! вынести в другое место этот метод
    if (!req.company.imagesController.isFilePresentInRequest(req)) {
        return next(new JSONError(StringResources.answers.REGISTER,
                                  StringResources.errors.IMAGE_NOT_PRESENT_IN_REQUEST));
    }

    Promise.all([
        Category.findCategoryByID(req.body.category),
        Company.isLoginFree(req.body.login)
    ]).then(function(results) {
        var companyParams = {
                login:    req.body.login,
                category: results[0],
                password: req.body.password,
                email:    req.body.email,
                name:     req.body.name,
                INN:      req.body.INN,
                OGRN:     req.body.OGRN,
                active:   false,
                logo:     '/companies/' + req.file.filename
            };

        var company = new Company(companyParams);

        return company.promisedSave();
    })
    .then(function(company) {
        var activationHash = company.activationController.generateActivationHash();

        company.mailController.sendActivationEmail();
        return company.activationController.setActivationHash(activationHash);
    })
    .then(function(company) {
        Shappy.logger.info('Зарегистрировал новую компанию с логином ' + company.login);
        res.JSONAnswer(StringResources.answers.REGISTER,
                       StringResources.answers.SUCCESS);
    })
    .catch(next);
};

var authorizeCompany = function(req, res, next) {
    Company.authorize(req.body.login, req.body.password, (err, company) => {
        if (err) {
            return next(err);
        }

        if (!company.active) {
            Shappy.logger.info('Компания не активирована ' + req.body.login);
            return next(new JSONError('unactivated', company._id.toString(), 403));
        }

        var token = company.getToken();

        Shappy.logger.info('Авторизовалась компания ' + req.body.login);
        res.JSONAnswer('token', token);
    });
};

var resendCompanyActivationEmail = function(req, res, next) {
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
            comapny.mailController.sendActivationEmail();
            res.JSONAnswer('resend', 'success');
        } else {
            return next(new JSONError('error', 'Эта компания уже активирована'));
        }

    });
};

var tryActivateCompany = function(req, res, next) {
    var activationHash = req.query.hash;

    Company.findAndActivateByHash(activationHash)
        .then(function(company) {
            res.redirect(Shappy.config.common.verifyRedirectUrl + company.getToken());
        })
        .catch(next);
};

module.exports = {
    registerNewCompany: registerNewCompany,
    authorizeCompany: authorizeCompany,
    resendActivationEmail: resendCompanyActivationEmail,
    tryActivateCompany: tryActivateCompany
};