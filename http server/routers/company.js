var express          = require('express'),
    Controllers      = require('../controllers'),
    FileStorages     = require('../../lib/file_storages'),
    StockRouter      = require('./models/stocks'),
    CompaniesRouter  = require('./models/companies'),
    CategoriesRouter = require('./models/categories'),
    StatsRouter      = require('./mechanics/stats'),
    router           = express.Router();

const REGISTER_REQUIRED_FIELDS = ['login', 'password', 'category'];

router.post('/register', FileStorages.saveCompanyLogoFromField.single('logo'),
                         Controllers.Common.fieldsMustPresent(REGISTER_REQUIRED_FIELDS),
                         Controllers.Common.loginAndPasswordMustBeCorrect,
                         Controllers.Company.loginMustBeFree,
                         Controllers.Models.loadCategoryFromField('category'),
                         Controllers.Company.registerNewCompany);

router.post('/authorize', Controllers.Common.fieldsMustPresent(['login', 'password']),
                          Controllers.Common.loginAndPasswordMustBeCorrect,
                          Controllers.Company.authorizeCompany);

router.post('/resend', Controllers.Common.fieldsMustPresent(['id']),
                       Controllers.Company.resendCompanyActivationEmail);

router.get( '/activate', Controllers.Common.fieldsMustPresent(['hash']),
                         Controllers.Company.tryActivateCompany);

router.use( '/stocks/create', FileStorages.saveStockImageFromField.single('logo'));
router.use( '/stocks/edit',   FileStorages.saveStockImageFromField.single('logo'));

router.use(Controllers.Common.loadCompanyModel);
router.use('/stocks',     StockRouter);
router.use('/companies',  CompaniesRouter);
router.use('/categories', CategoriesRouter);
router.use('/stats',      StatsRouter);

module.exports = router;