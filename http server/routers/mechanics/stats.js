var express     = require('express'),
    Controllers = require('../../controllers'),
    router      = express.Router();


router.use(Controllers.Common.mustBeLoggedAsCompany);

router.get('/stocksperdate', Controllers.Stats.stocksPerDate);
router.get('/usersperstock', Controllers.Stats.usersPerStock);
router.get('/countperstock', Controllers.Stats.countPerStock);
router.get('/stockinfo',     Controllers.Stats.stockInfo);
router.get('/numberofuses',  Controllers.Stats.numberOfUses);

module.exports = router;