var express          = require('express'),
    Controllers      = require('../controllers'),
    StocksRouter     = require('./models/stocks'),
    CompaniesRouter  = require('./models/companies'),
    FriendsRouter    = require('./mechanics/friends'),
    CategoriesRouter = require('./models/categories'),

    router  = express.Router();

const CLIENT_REGISTER_REQUIRED_FIELDS = ['login', 'password', 'name', 'surname', 'mail', 'phone'];

router.post('/register',  Controllers.Common.fieldsMustPresent(CLIENT_REGISTER_REQUIRED_FIELDS),
                          Controllers.Common.loginAndPasswordMustBeCorrect,
                          Controllers.Client.loginMustBeFree,
                          Controllers.Client.registerNewClient);

router.post('/authorize', Controllers.Common.fieldsMustPresent(['login', 'password']),
                          Controllers.Client.authorizeClient);

router.use(Controllers.Common.loadClientModel);

router.use('/stocks',     StocksRouter);
router.use('/companies',  CompaniesRouter);
router.use('/friends',    FriendsRouter);
router.use('/categories', CategoriesRouter);

module.exports = router;

