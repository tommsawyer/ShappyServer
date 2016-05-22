var express    = require('express');
var mongoose   = require('mongoose');
var mw         = require('../../utils/middlewares.js');
var ObjectID   = require('mongodb').ObjectID;
var filter     = require('../mechanics/filter.js');
var codes      = require('../mechanics/codes.js');
var dateHelper = require('../../utils/dateHelper.js');
var Stock      = mongoose.model('Stock');
var router     = express.Router();
var JSONError  = require('../../lib/json_error');


router.use('/filter', filter);
router.use('/codes',  codes);

router.post('/create', mw.requireCompanyAuth, (req, res, next) => {
    var categoryID  = null;
    var startDate   = dateHelper.tryParseDate(req.body.startDate);
    var endDate     = dateHelper.tryParseDate(req.body.endDate);

    if (!req.file) {
        return next(new JSONError('error', 'У акции не указан логотип!'));
    }

    try {
        categoryID = new ObjectID(req.body.category);
    } catch (e) {}


    if (!dateHelper.checkDates(startDate, endDate))
        return next(new JSONError('error', 'Даты проведения акции указаны некорректно'));

    var stock = new Stock({
        name: req.body.name,
        category: categoryID,
        description: req.body.description,
        company: req.company._id,
        startDate: startDate,
        endDate: endDate
    });

    stock.createImages(req.file);

    stock.save((err, stock) => {
        if (err) {
            return next(err);
        }

        res.JSONAnswer('stock', {id: stock._id, logo: stock.logo});
    });
});

router.post('/edit', mw.requireCompanyAuth, (req, res, next) => {
    var startDate = dateHelper.tryParseDate(req.body.startDate);
    var endDate   = dateHelper.tryParseDate(req.body.endDate);

    if (!dateHelper.checkDates(startDate, endDate))
        return next(new JSONError('error', 'Даты проведения акции указаны некорректно'));

    try {
        var categoryID = new ObjectID(req.body.category);
    } catch (e) {}


    Stock.findOne({'_id' : new ObjectID(req.body.id)}, (err, stock) => {
        if (err) return next(err);

        if (!stock) {
            Shappy.logger.warn('Нет акции с айди ' + req.body.id);
            return next(new JSONError('error', 'Нет такой акции'));
        }

        if (!stock.checkOwner(req.company._id)) {
            Shappy.logger.warn('Компания с айди ' + req.company._id + ' не может редактировать акцию ' + req.body.id);
            return next(new JSONError('error', 'Вы не можете редактировать эту акцию'));
        }

        if (categoryID) {
            stock.category = categoryID;
        }

        stock.name = req.body.name;
        stock.description = req.body.description;
        stock.startDate = startDate;
        stock.endDate = endDate;

        if (!req.file) {
            Shappy.logger.warn('Запрос редактирования акции без логотипа');

            stock.save((err) => {
                if (err) return next(err);
                res.JSONAnswer('stock', stock.logo);
            });
        } else {
            stock.removeImages((err) => {
                if (err) return next(err);

                stock.createImages(req.file);

                stock.save((err) => {
                    if (err) return next(err);
                    res.JSONAnswer('stock', stock.logo);
                });
            });
        }
    });
});

router.post('/remove', mw.requireCompanyAuth, (req, res, next) => {
    Stock.findOne({_id: req.body.id}, (err, stock) => {
        if (err) {
            return next(err);
        }
        if (!stock) {
            return next(new JSONError('error', 'Нет такой акции'));
        }

        if (!stock.checkOwner(req.company._id.toString())) {
            return next(new JSONError('error', 'Эта компания не имеет прав для удаления этой акции'));
        }

        stock.prepareRemove((err) => {
            if (err) {
                return next(err);
            }

            stock.remove();
            Shappy.logger.info('Акция с айди ' + stock._id + ' удалена');
            res.JSONAnswer('stock', stock._id);
        });
    });
});

router.post('/subscribe', mw.requireClientAuth, (req, res, next) => {
    req.user.subscribe(req.body.id, (err, subscription) => {
        if (err) {
            return next(err);
        }

        req.user.save((err, user) => {
            if (err) {
                return next(err);
            }

            res.JSONAnswer('subscribeStock', subscription.code);
        });
    });
});

router.post('/unsubscribe', mw.requireClientAuth, (req, res, next) => {
    Stock.findOne({'_id':new ObjectID(req.body.id)}, (err, stock) => {
        if (err) {
            return next(err);
        }
        stock.removeSubscriber(req.user._id.toString(), (err) => {
            if (err) {
                return next(err);
            }

            req.user.unsubscribe(stock._id);
            res.JSONAnswer('unsubscribestock', 'success');
        });
    });
});

router.get('/info', mw.requireAnyAuth, (req, res, next) => {
    try {
        var stockID = new ObjectID(req.query.id);
    } catch (e) {
        return next(new JSONError('stockinfo', 'Нет такой акции', 404));
    }


    Stock.findOneAndPopulate({_id: stockID}, (err, stock) => {
        if (err) return next(err);

        if (!stock) return next(new JSONError('stockinfo', 'Нет такой акции', 404));

        if (req.user) stock.incrementNumberOfViews();

        res.JSONAnswer('stockinfo', stock.toJSON(req.user ? req.user._id : undefined));
    });
});

router.get('/feed', mw.requireClientAuth, (req, res, next) => {
    req.user.getSubscribitions((err, stocks) => {
        if (err) {
            return next(err);
        }

        res.JSONAnswer('userstocks', stocks);
    });
});

router.get('/all', mw.requireClientAuth, (req, res, next) => {
    Stock.findAndPopulate({}, (err, stocks) => {
        if (err) return next(err);

        if (stocks.length == 0)
            res.JSONAnswer('stock', []);

        res.JSONAnswer('stock', Stock.arrayToJSON(stocks, req.user._id));
    });
});

router.get('/me', mw.requireCompanyAuth, (req, res, next) => {
    Stock.byCompanyID(req.company._id, (err, stocks) => {
        if (err) {
            return next(err);
        }

        Shappy.logger.info('Отправляю клиенту акции компании ' + req.company.login);
        res.JSONAnswer('stocks', Stock.arrayToJSON(stocks));
    });
});

module.exports = router;