var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var User      = mongoose.model('User');
var JSONError = require('../lib/json_error');
var SHA256    = require('crypto-js/sha256');
var ImagesController = require('../lib/mechanics/company/images');
var MailController = require('../lib/mechanics/company/mail');
var ActivationController = require('../lib/mechanics/company/activation');

var CompanySchema = new Schema({
    name: String,
    INN: String,
    OGRN: String,
    category: Schema.Types.ObjectId,
    parentCompany: String,
    region: String,
    email: String,
    address: String,
    logo: String,
    type: String,
    subscribers: [Schema.Types.Object],
    active: Boolean,
    activationHash: String
});

CompanySchema.methods.toJSON = function () {
    var companyJSON =  {
        id: this._id,
        name: this.name,
        INN: this.INN,
        OGRN: this.OGRN,
        parentCompany: this.parentCompany,
        region: this.region,
        address: this.address,
        logo: this.logo
    };

    return companyJSON;
};

CompanySchema.methods.createImages = function(filename){
    if (!filename) {
        return;
    }

    this.logo = '/companies/' + filename;
};

CompanySchema.methods.isSubscribed = function (userID) {
    return this.subscribers.indexOf(userID) !== -1;
};

CompanySchema.methods.addSubscriber = function (subscriberID) {
    var self = this;

    return new Promise(function(resolve, reject) {
        if (self.isSubscribed(subscriberID)) {
            return reject(new JSONError('error', 'Этот пользователь уже есть в подписчиках'));
        }

        self.subscribers.push(subscriberID);
        self.save((err) => {
            if (err) return reject(err);

            Shappy.logger.info('Добавил пользователя ' + subscriberID.toString() + ' к подписчикам компании ' + self._id.toString());
            resolve();
        });
    });
};

CompanySchema.methods.removeSubscriber = function (subcriberID) {
    var self = this;

    return new Promise(function(resolve, reject) {
        if (!self.isSubscribed(subscriberID)) {
            return reject(new JSONError('error', 'Этого пользователя нет в подписчиках'));
        }

        this.subscribers.splice(self.subscribers.indexOf(subcriberID), 1);
        this.save((err) => {
            if (err) return reject(err);

            Shappy.logger.info('Удалил пользователя ' + id.toString() + ' из подписчиков компании ' + this._id.toString());
            resolve();
        });
    });
};

CompanySchema.statics.findAndActivateByHash = function(hash) {
    var self = this,
        searchQuery = {
            activationHash: hash
        };

    return new Promise(function(resolve, reject) {
        self.findOne(searchQuery, (err, company) => {
            if (err) return reject(err);

            if (!company) 
                return reject(new Error('Нет такой компании или уже активирована'));

            resolve(company.activationController.activate());
        });
    });

};

// Инициализация контроллеров модели
CompanySchema.post('init', (model, next) => {
    model.imagesController     = new ImagesController(model);
    model.mailController       = new MailController(model);
    model.activationController = new ActivationController(model);
    next();
});

// Наследование от общего абстрактного класса
User.discriminator('Company', CompanySchema);
Shappy.logger.info('Подключил модель Company');
