var express     = require('express'),
    Controllers = require('../../controllers_new'),
    router      = express.Router();

/*
router.use(Controllers.Common.mustBeLoggedAsClient);

router.get('/',              Controllers.Filter.complexStockSearch);
router.get('/company',       Controllers.Filter.findStocksByCompany);
router.get('/category',      Controllers.Filter.findStocksBy);
router.get('/search',        Controllers.Filter.findStockByKeyWord);
router.get('/subscriptions', Controllers.Filter.findSubscribedStocks);
router.get('/friends',       Controllers.Filter.findFriendsStocks);
*/
module.exports = router;
