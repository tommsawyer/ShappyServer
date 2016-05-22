var path     = require('path'),
    mongoose = require('mongoose'),
    Category = mongoose.model('Category');

const PATH_TO_LOG_FILE = path.resolve(__dirname + '/../../logs/log.txt');

class AdminController {
    static getLogs(req, res, next) {
        res.sendFile(PATH_TO_LOG_FILE);
    }

    static clearLogs(req, res, next) {
        Shappy.logger.clearLog();
        Shappy.logger.info('Очищен лог-файл');
        res.JSONAnswer('clear logs', 'success');
    }

    static addCategory(req, res, next) {
        var parentCategory = null;

        if (req.body.parent) {
            parentCategory = new ObjectID(req.body.parent);
        }

        Category.create({
            name: req.body.name,
            parentCategory: parentCategory
        });
        res.end('OK');
    }
}

module.exports = AdminController;

