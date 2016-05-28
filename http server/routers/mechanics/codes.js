var express     = require('express'),
    Controllers = require('../../controllers_new'),
    router      = express.Router();


//router.use(Controllers.Common.mustBeLoggedAsCompany);

router.get('/check',  Controllers.Codes.checkActivationCode);
router.post('/apply', Controllers.Codes.applyActivationCode);

module.exports = router;
