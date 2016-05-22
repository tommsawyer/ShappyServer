var express     = require('express');
var mongoose    = require('mongoose');
var storages    = require('../../../lib/file_storages');
var AuthManager = require('../../../lib/auth_manager');
var Stocks      = require('../models/stocks.js');
var Companies   = require('../models/companies.js');
var Categories  = require('../models/categories.js');
var Stats       = require('../mechanics/stats.js');
var JSONError   = require('../../lib/json_error');
var mail        = require('../../utils/mail.js');
var multer      = require('multer'); // миддлвеар для загрузки файлов
var companyLogo = multer({storage: storages.companyStorage});
var stockLogo   = multer({storage: storages.stockStorage});
var Company     = mongoose.model('Company');
var router      = express.Router();
var ObjectID    = require('mongodb').ObjectId;

var registerNewCompany = function(req, res, next) {
    if (!req.file) {
        Shappy.logger.info('Нет логотипа при регистрации компании');
        return next(new JSONError('register', 'Необходим логотип при регистрации компании'));
    }

    var categoryID = null;
    try {
        categoryID = new ObjectID(req.body.category);
    } catch (e) {}

    Company.byLogin(req.body.login, (err, company) => {
        if (company) {
            Shappy.logger.info('Компания с логином ' + req.body.login + ' уже существует');
            return next(new JSONError('error', 'Компания с таким логином уже существует'));
        }

        Company.create({
            login: req.body.login,
            category: categoryID,
            password: req.body.password,
            email: req.body.email,
            name: req.body.name,
            INN: req.body.INN,
            OGRN: req.body.OGRN,
            active: false,
            logo: '/companies/' + req.file.filename
        }, (err, company) => {
            if (err) {
                return next(err);
            }

            var activationHash = company.generateActivationHash();

            company.setActivationHash(activationHash);
            mail.sendActivationEmail(company.email, activationHash);

            Shappy.logger.info('Создал новую компанию ' + company.login);
            res.JSONAnswer('register', 'успешно');
        });
    });
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
            mail.sendActivationEmail(company.email, company.activationHash);
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

router.post('/register',      companyLogo.single('logo'), mw.checkLoginAndPassword, registerNewCompany);
router.post('/authorize',     authorizeCompany);
router.post('/resend',        resendCompanyActivationEmail);
router.get( '/activate',      tryActivateCompany);
router.use( '/stocks/create', stockLogo.single('logo'));
router.use( '/stocks/edit',   stockLogo.single('logo'));

router.use(AuthManager.mustBeLoggedAsCompany);
router.use('/stocks',     Stocks);
router.use('/companies',  Companies);
router.use('/categories', Categories);
router.use('/stats',      Stats);

module.exports = router;