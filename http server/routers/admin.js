var express     = require('express'),
    Controllers = require('../controllers'),
    router      = express.Router();

router.use('/logs',      Controllers.Admin.getLogs);
router.use('/clearlogs', Controllers.Admin.clearLogs);
router.use('/category',  Controllers.Admin.addCategory);

module.exports = router;
