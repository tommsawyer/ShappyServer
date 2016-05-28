var express = require('express'),
    Controllers = require('../controllers_new'),
    AuthManager = require('../../lib/auth_manager'),
    StocksRouter = require('./models/stocks'),
    CompaniesRouter = require('./models/companies'),
    FriendsRouter  = require('./mechanics/friends'),
    CategoriesRouter = require('./models/categories'),

    router  = express.Router();

router.post('/register', Controllers.Client.registerNewClient);

router.post('/authorize', Controllers.Client.authorizeClient);

router.use(AuthManager.loadClientModel);

router.use('/stocks', StocksRouter);
router.use('/companies', CompaniesRouter);
router.use('/friends', FriendsRouter);
router.use('/categories', CategoriesRouter);

module.exports = router;

