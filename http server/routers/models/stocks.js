var express      = require('express'),
    Controllers  = require('../../controllers_new'),
    FilterRouter = require('../mechanics/filter'),
    CodesRouter  = require('../mechanics/codes'),
    router       = express.Router();

router.use('/filter', FilterRouter);
router.use('/codes',  CodesRouter);

router.get('/info', Controllers.Common.mustBeLoggedAsAnyUserType,
                    Controllers.Common.fieldsMustPresent(['id']),
                    Controllers.Stocks.getInfoAboutStock);

router.post('/create', Controllers.Common.mustBeLoggedAsCompany,
                       Controllers.Stocks.createNewStock);

router.post('/edit', Controllers.Common.mustBeLoggedAsCompany,
                     Controllers.Stocks.editStock);

router.post('/remove', Controllers.Common.mustBeLoggedAsCompany,
                       Controllers.Stocks.removeStock);

router.get('/me', Controllers.Common.mustBeLoggedAsCompany,
                  Controllers.Stocks.getStocksOfCurrentCompany);


router.use(Controllers.Common.mustBeLoggedAsClient);

router.post('/subscribe', Controllers.Stocks.subscribeClientToStock);
router.post('/unsubscribe', Controllers.Stocks.unsubscribeClientFromStock);
router.get('/feed', Controllers.Stocks.getClientFeed);
router.get('/all', Controllers.Stocks.getAllStocks);

module.exports = router;
