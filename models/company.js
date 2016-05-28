var mongoose             = require('mongoose'),
    ImagesController     = require('../lib/mechanics/company/images'),
    MailController       = require('../lib/mechanics/company/mail'),
    ActivationController = require('../lib/mechanics/company/activation'),
    Schema               = mongoose.Schema,
    User                 = mongoose.model('User');

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
