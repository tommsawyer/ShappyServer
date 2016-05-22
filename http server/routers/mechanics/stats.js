var express     = require('express'),
    Controllers = require('../../controllers_new'),
    router      = express.Router();


router.use(Controllers.Common.mustBeLoggedAsCompany);

router.get('/stocksperdate', Controllers.Stocks.stocksPerDate);
router.get('/usersperstock', Controllers.Stocks.usersPerStock);
router.get('/countperstock', Controllers.Stocks.countPerStock);
router.get('/stockinfo',     Controllers.Stocks.stockInfo);
router.get('/numberofuses',  Controllers.Stocks.numberOfUses);

module.exports = router;