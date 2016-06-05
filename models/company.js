var mongoose  = require('mongoose'),
    Mechanics = require('../lib/mechanics'),
    Schema    = mongoose.Schema,
    User      = mongoose.model('User');

var CompanySchema = new Schema({
    name:           String,
    INN:            String,
    OGRN:           String,
    category:       Schema.Types.ObjectId,
    parentCompany:  String,
    region:         String,
    email:          String,
    address:        String,
    logo:           String,
    subscribers:    [Schema.Types.ObjectId],
    active:         Boolean,
    activationHash: String
});

CompanySchema.methods.toJSON = function () {
    return {
        id: this._id,
        name: this.name,
        INN: this.INN,
        OGRN: this.OGRN,
        parentCompany: this.parentCompany,
        region: this.region,
        address: this.address,
        logo: this.logo
    };
};

CompanySchema.methods.promisedSave = function() {
    var self = this;

    return new Promise(function(resolve, reject) {
        self.save(function(err) {
            if (err) return reject(err);
            resolve(self);
        });
    });
};

CompanySchema.statics.injectControllers = function(model) {
    model.imagesController     = new Mechanics.Company.ImagesController(model);
    model.mailController       = new Mechanics.Company.MailController(model);
    model.activationController = new Mechanics.Company.ActivationController(model);
};

// Инициализация контроллеров модели
CompanySchema.post('init', (model, next) => {
    model.imagesController     = new Mechanics.Company.ImagesController(model);
    model.mailController       = new Mechanics.Company.MailController(model);
    model.activationController = new Mechanics.Company.ActivationController(model);

    next();
});

// Наследование от общего абстрактного класса
User.discriminator('Company', CompanySchema);
Shappy.logger.info('Подключил модель Company');