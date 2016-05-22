var express     = require('express'),
    Controllers = require('../../controllers_new'),
    router      = express.Router();


router.use(Controllers.Common.mustBeLoggedAsCompany);

router.get('/check',  Controllers.ActivationCodes.checkActivationCode);
router.post('/apply', Controllers.ActivationCodes.applyActivationCode);

module.exports = router;
