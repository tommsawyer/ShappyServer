'use strict';

var Logger        = require('./logger'),
    ConfigManager = require('./config_manager'),
    Utils         = require('./utils');

module.exports = {
    logger: new Logger(),
    config: new ConfigManager(),
    utils:  Utils
};

