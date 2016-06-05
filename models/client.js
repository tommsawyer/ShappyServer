var mongoose          = require('mongoose'),
    Schema            = mongoose.Schema,
    Mechanics         = require('../lib/mechanics'),
    User              = mongoose.model('User');

var ClientSchema = new Schema({
    address: String,
    subscribes: {
        companies:  [Schema.Types.ObjectId],
        categories: [Schema.Types.ObjectId],
        stocks:     [Schema.Types.ObjectId]
    },
    FIO:     String,
    mail:    String,
    phone:   String,
    friends: [Schema.Types.ObjectId]
});

ClientSchema
    .virtual('name')
    .get(function() {
        var fio = this.FIO || '';
        return fio.split(' ')[0]
    });

ClientSchema
    .virtual('surname')
    .get(function() {
        var fio = this.FIO || '  ';
        return fio.split(' ')[1]
    });

ClientSchema.methods.toJSON = function (){
    return {
        id:      this._id,
        name:    this.name,
        surname: this.surname,
        mail:    this.mail,
        phone:   this.phone,
        friends: this.friends,
        login:   this.login
    };
};

ClientSchema.methods.promisedSave = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.save(function(err) {
            if (err) return reject(err);
            resolve(self);
        });
    });
};

// Инициализация контроллеров модели
ClientSchema.post('init', (model, next) => {
    model.friendsController    = new Mechanics.Client.FriendsController(model);
    model.companiesController  = new Mechanics.Client.CompaniesController(model);
    model.categoriesController = new Mechanics.Client.CategoriesController(model);
    model.stocksController     = new Mechanics.Client.StocksController(model);
    model.subscribesController = new Mechanics.Client.SubscribesController(model);

    next();
});

// наследование от модели User
User.discriminator('Client', ClientSchema);
Shappy.logger.info('Подключил модель Client');
