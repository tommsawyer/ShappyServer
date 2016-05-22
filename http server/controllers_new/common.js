var JsonError = require('../../lib/json_error');

var fieldsMustPresent = function (fieldsArray) {
    return function(req, res, next) {
        var emptyFields = [];
            queryParams = req.method === 'POST' ? req.body : req.query;

        fieldsArray.forEach(function(field) {
           if (!queryParams[field]) {
               emptyFields.push(field);
           }
        });

        var isAllFieldsPresent = (emptyFields.length === 0);

        if (!isAllFieldsPresent) {
            emptyFields = emptyFields.join(' ');
            return next(new JsonError('bad request', 'В запросе нет полей: ' + emptyFields));
        }

        next();
    };
};

var loginAndPasswordMustBeCorrect = function(req, res, next) {
    var loginRegExp = /[a-zA-Z]{5,}/,
        passwordRegExp = /.{5,20}/;

    if (!req.body.login.match(loginRegExp)) {
        return next(new JSONError('error', 'Некорректный логин'));
    }

    if (!req.body.password.match(passwordRegExp)) {
        return next(new JSONError('error', 'Некорректный пароль'));
    }

    next();
};

module.exports = {
    fieldsMustPresent: fieldsMustPresent,
    loginAndPasswordMustBeCorrect: loginAndPasswordMustBeCorrect
};