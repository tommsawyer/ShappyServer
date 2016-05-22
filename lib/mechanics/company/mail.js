'use strict';

var MechanicsController = require('../mechanics_controller'),
    nodemailer = require('nodemailer');

class MailController extends MechanicsController {
    constructor(model) {
        super(model);

        this.mailTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: Shappy.config.mail.login,
                pass: Shappy.config.password
            }
        }, {
            from: Shappy.config.from
        });
    }

    /**
     * Посылает е-мейл с ссылкой для активации компании на ее почту
     * @returns {Promise} промис, ресолвящийся если пиьсмо успешно отправлено
     */
    sendActivationEmail() {
        var self = this,
            activationHash = this.model.activationHash,
            companyEmail   = this.model.email;

        var mailOptions = {
            to: companyEmail,
            subject: 'Подтверждение регистрации на МММ',
            html: this._generateHTMLForActivationEmail(Shappy.config.mail.href, activationHash);
        }

        return new Promise(function(resolve, reject) {
            self.mailTransport.sendMail(mailOptions, function (err, info) {
                if (err) {
                    Shappy.logger.error(err);
                    return reject(err);
                }

                Shappy.logger.info(info.response);
                resolve(info);
            });
        });
    }

    /**
     * Генерирует HTML-код, который будет находится внутри письма, отосланному клиенту
     * @param redirectURL адрес, куда будет перенаправлен клиент после клика на ссылку
     * @param activationHash активационный хэш для этой компании
     * @returns {string}
     * @private
     */
    _generateHTMLForActivationEmail(redirectURL, activationHash) {
        var redirectTo = redirectURL + activationHash;

        return 'Подтвердите регистрацию кликнув по этой ссылке: <a href="' + redirectTo + '">Подтвердить</a>';
    }
}

module.exports = MailController;
