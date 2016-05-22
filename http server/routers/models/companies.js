var express     = require('express'),
    Controllers = require('../../controllers_new'),
    router      = express.Router();

router.get('/info', Controllers.Companies.getInfoAboutCompany);

router.get('/me',   Controllers.Common.mustBeLoggedAsCompany,
                    Controllers.Companies.getCurrentCompanyInfo);

router.use(Controllers.Common.mustBeLoggedAsClient);
router.get('/all',           Controllers.Companies.getAllCompanies);
router.get('/subscribe',     Controllers.Companies.subscribeClientToCompany);
router.get('/unsubscribe',   Controllers.Companies.unsubscribeClientFromCompany);
router.get('/filter/search', Controllers.Companies.findCompaniesByFilter);
router.get('/subscriptions', Controllers.Companies.getClientSubscribedCompanies);

module.exports = router;
