var express     = require('express'),
    Controllers = require('../../controllers_new'),
    router      = express.Router();

router.use(Controllers.Common.mustBeLoggedAsClient);

router.get('/all',           Controllers.Categories.getAllCategories);
router.get('/subscribe',     Controllers.Categories.subscribeClientToCategory);
router.get('/unsubscribe',   Controllers.Categories.unsubscribeClientFromCategory);
router.get('/filter/search', Controllers.Categories.searchCategories);
router.get('/subscriptions', Controllers.Categories.findClientSubscriptions);

module.exports = router;
