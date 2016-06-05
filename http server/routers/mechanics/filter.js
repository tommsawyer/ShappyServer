var express     = require('express'),
    Controllers = require('../../controllers'),
    router      = express.Router();

router.use(Controllers.Common.mustBeLoggedAsClient);

router.get('/',              Controllers.Filter.complexStockSearch);
router.get('/company',       Controllers.Filter.findStocksByCompany);
router.get('/category',      Controllers.Filter.findStocksByCategory);
router.get('/search',        Controllers.Filter.findStocksByKeyWord);
router.get('/subscriptions', Controllers.Filter.findSubscribedStocks);
router.get('/friends',       Controllers.Filter.findFriendsStocks);

module.exports = router;
