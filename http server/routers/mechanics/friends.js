var express     = require('express'),
    Controllers = require('../../controllers'),
    router      = express.Router();

router.use(Controllers.Common.mustBeLoggedAsClient);

router.get('/add',    Controllers.Friends.addNewFriend);
router.get('/delete', Controllers.Friends.deleteFriend);
router.get('/all',    Controllers.Friends.getAllFriends);
router.get('/filter', Controllers.Friends.findClients);

module.exports = router;