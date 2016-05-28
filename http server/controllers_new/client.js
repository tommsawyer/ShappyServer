'use strict';

var mongoose        = require('mongoose'),
    StringResources = require('../../utils/string_resources'),
    QueryBuilder    = require('../../lib/query_builder'),
    JSONError       = require('../../lib/json_error'),
    Client          = mongoose.model('Client');

class ClientController {
    static loginMustBeFree(req, res, next) {
        var query = QueryBuilder.fieldEqualsTo('login', req.body.login);

        Client.findOne(query, function(err, client) {
            if (err) return next(err);

            if (client) {
                var error = new JSONError(StringResources.answers.ERROR,
                                          StringResources.errors.USERNAME_ALREADY_TAKEN);
                return next(error);
            }

            next();
        })
    }

    static registerNewClient(req, res, next) {
        var client = new Client({
            login:    req.body.login,
            password: req.body.password,
            FIO:      req.body.name + ' ' + req.body.surname,
            mail:     req.body.mail,
            phone:    req.body.phone
        });

        client.promisedSave()
            .then(function(client) {
                Shappy.logger.info('Создан новый пользователь с логином' + client.login);
                res.JSONAnswer(StringResources.answers.REGISTER, client.getToken());
            })
            .catch(next);
    }

    static authorizeClient(req, res, next) {
        var query = QueryBuilder.fieldEqualsTo('login', req.body.login);

        Client.findOne(query, function(err, client) {
            if (err) return next(err);

            if (!client) {
                var error = new JSONError(StringResources.answers.ERROR,
                                          StringResources.errors.NO_SUCH_USER);
            }

            var userInfo = client.toJSON();
            userInfo['token'] = client.getToken();

            Shappy.logger.info('Авторизовался пользователь с логином ' + client.login);
            res.JSONAnswer(StringResources.answers.USER_INFO, userInfo);
        })
    }
}

module.exports = ClientController;