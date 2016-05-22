var mongoose          = require('mongoose'),
    Schema            = mongoose.Schema,
    ObjectID          = require('mongodb').ObjectID,
    JSONError         = require('../lib/json_error'),
    FriendsController = require('../lib/mechanics/client/friends');
    User              = mongoose.model('User');

var ClientSchema = new Schema({
    address: String,
    filters: {
        companies: [Schema.Types.ObjectId],
        categories: [Schema.Types.ObjectId]
    },
    FIO:     String,
    mail:    String,
    phone:   String,
    friends: [Schema.Types.ObjectId],
    stocks:  [Schema.Types.ObjectId] // айди акций, на которые подписан пользователь
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

ClientSchema.methods.getSubscribitions = function (callback) {
    var Stock = mongoose.model('Stock');
    var subscribitions = this.stocks.map((id) => {
        return new ObjectID(id)
    });
    var self = this;

    if (subscribitions.length == 0) {
        callback(null, []);
        return;
    }

    Stock.findAndPopulate({_id: {$in: subscribitions}}, (err, stocks) => {
        if (err) {
            callback(err);
            return;
        }

        callback(null, Stock.arrayToJSON(stocks, self._id));
    });
};

ClientSchema.methods.subscribe = function (id, callback) {
    var Stock = mongoose.model('Stock');

    Stock.findOne({_id: new ObjectID(id)}, (err, stock) => {
        if (err) {
            callback(err);
        }

        if (!stock) {
            Shappy.logger.warn('Не существует акции с айди ' + id);
            callback(new JSONError('error', 'Нет такой акции'));
            return;
        }

        Shappy.logger.info('Нашел акцию с айди ' + stock._id.toString());

        var id = stock._id.toString();
        var subscribes = this.stocks;
        var self = this;

        if (subscribes.indexOf(id) != -1) {
            Shappy.logger.warn('Попытка подписаться на акцию, которая уже в подписках. Айди ' + id);
            callback(new JSONError('error', 'Вы уже подписаны на эту акцию'));
            return;
        }

        subscribes.push(id);
        this.stocks = subscribes;

        stock.addSubscriber(this._id.toString(), (err, subscription) => {
            if (err) return callback(err);
            Shappy.logger.info('Юзер ' + self.login + ' подписался на акцию ' + id);
            callback(null, subscription);
        });
    });
};

ClientSchema.methods.unsubscribe = function (id) {
    var stockPosition = this.stocks.indexOf(id.toString());

    if (stockPosition == -1) {
        return false;
    }

    this.stocks.splice(stockPosition, 1);
    Shappy.logger.info('Пользователь ' + this.login + ' отписался от акции ' + id);
    this.save();
};

ClientSchema.methods.subscribeToCompany = function (id, callback) {
    if (this.filters.companies.indexOf(id) != -1) {
        return callback(new JSONError('error', 'Вы уже подписаны на эту компанию'));
    }

    this.filters.companies.push(id);
    Shappy.logger.info('Пользователь ' + this.login + ' подписался на компанию с айди ' + id.toString());
    callback(null);
    this.save();
};

ClientSchema.methods.unsubscribeFromCompany = function (id, callback) {
    var companyPosition = this.filters.companies.indexOf(id);

    if (companyPosition == -1) {
        return callback(new JSONError('error', 'Вы не подписаны на эту компанию'));
    }

    this.filters.companies.splice(companyPosition, 1);
    Shappy.logger.info('Пользователь ' + this.login + ' отписался от компании с айди ' + id.toString());
    callback(null);
    this.save();
};

ClientSchema.methods.subscribeToCategory = function (id, callback) {
    if (this.filters.categories.indexOf(id) != -1) {
        return callback(new JSONError('error', 'Вы уже подписаны на эту категорию'));
    }

    this.filters.categories.push(id);
    Shappy.logger.info('Пользователь ' + this.login + ' подписался на категорию с айди ' + id.toString());
    callback(null);
    this.save();
};

ClientSchema.methods.unsubscribeFromCategory = function (id, callback) {
    var categoryPosition = this.filters.categories.indexOf(id);

    if (categoryPosition == -1) {
        return callback(new JSONError('error', 'Вы не подписаны на эту категорию'));
    }

    this.filters.categories.splice(categoryPosition, 1);
    Shappy.logger.info('Пользователь ' + this.login + ' отписался от категории с айди ' + id.toString());
    callback(null);
    this.save();
};

ClientSchema.methods.toJSON = function (){
    var info = {
        'id': this._id,
        'name': this.name,
        'surname': this.surname,
        'mail': this.mail,
        'phone': this.phone,
        'friends': this.friends,
        'login': this.login
    };

    return info;
};

ClientSchema.statics.byFilter = function(userID, FIO, mail, phone, callback) {
    var fields = {
        'FIO': FIO,
        'mail': mail,
        'phone': phone
    };

    var idNotEqualUserID = {
        _id: {
            $ne: userID.toString()
        }
    };

    var query = {
        $and: [
            {$or: []},
            idNotEqualUserID
        ]
    };

    for (var name in fields) {
        if (fields[name]) {
          var obj = {};
          obj[name] = new RegExp('.*' + fields[name] + '.*', 'i');
          query.$and[0].$or.push(obj);
        }
    }

    Shappy.logger.inspect('Поисковые параметры: ', fields);

    if (Object.keys(query.$and[0].$or).length == 0) {
        this.find(idNotEqualUserID, (err, clients) => {
            if (err) return callback(err);

            if (clients.length == 0) return callback(null, []);

            callback(null, clients.map((client) => {
                return client.toJSON();
            }));
        });
        return;
    }

    this.find(query, (err, clients) => {
        if (err) return callback(err);

        if (clients.length == 0) return callback(null, []);

        callback(null, clients.map((client) => {
            return client.toJSON();
        }));
    });
};

// Инициализация контроллеров модели
ClientSchema.post('init', (model, next) => {
    model.friendsController = new FriendsController(model);
    next();
});

User.discriminator('Client', ClientSchema);
Shappy.logger.info('Подключил модель Client');
