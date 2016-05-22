var express       = require('express'),
    companyRouter = require('./company'),
    userRouter    = require('./user'),
    adminRouter   = require('./admin'),
    router        = express.Router();

router.use('/company', companyRouter);
router.use('/user',    userRouter);

//TODO: должен быть удален, а его функционал перемещен в отдельный проект
router.use('/admin',   adminRouter);

module.exports = router;

