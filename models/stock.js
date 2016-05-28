var mongoose  = require('mongoose');
var fs        = require('fs');
var ObjectID  = require('mongodb').ObjectID;
var JSONError = require('../lib/json_error');
var Schema    = mongoose.Schema;
var StringResources = require('../utils/string_resources');

var StockSchema = new Schema({
    name: String,
    description: String,
    logo: String,
    thumb: String,
    startDate: Date,
    endDate: Date,
    viewsInFeed: Number,
    views: Number,
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company'
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    subscribes: [{
        id: Schema.Types.ObjectId,
        date: Date,
        code: String,
        numberOfUses: [Date]
    }]
});

/**
 * Сохраняет модель акции
 * @returns {Promise} промис, который резолвится с моделью, если все успешно,
 * иначе реджектится с ошибкой
 */
StockSchema.methods.promisedSave = function() {
    var self = this;

    return new Promise(function(resolve, reject) {
        self.save(function(err, stock) {
            if (err) return reject(err);
            resolve(stock);
        });
    });
};

/* Выборка */

StockSchema.statics.bySubscriptionCode = function(code, callback) {
    var query = {
        subscribes: {
            $elemMatch: {
                code: code
            }
        }
    };

    this.findOneAndPopulate(query, (err, stock) => {
        if (err) return callback(err);
        if (!stock) return callback(new JSONError('error', 'Не найдено акции с таким активационным кодом', 404));

        callback(null, stock);
    });
};

StockSchema.statics.byUserFilter = function(filter, callback) {
    var Stock = mongoose.model('Stock');

    var query = {
        $or: [
            {company:  {$in: filter.companies }},
            {category: {$in: filter.categories}}
        ]
    };

    this.findAndPopulate(query, callback);
};

StockSchema.statics.bySearchWord = function (word, callback) {
    var searchRegExp = new RegExp('.*' + word + '.*', 'i');
    var query = {
        $or: [
            {'name': {$regex: searchRegExp}},
            {'description': {$regex: searchRegExp}}
        ]
    };

    this.findAndPopulate(query, callback);
};


StockSchema.statics.constructQuery = function (query) {
    var resultQuery = {
        $and: []
    };

    if (query.companyID) {
        resultQuery.$and.push({
            'company': query.companyID
        });
    }

    if (query.searchword) {
        var searchRegExp = new RegExp('.*' + query.searchword + '.*', 'i');

        resultQuery.$and.push({
            $or: [
                {'name': {$regex: searchRegExp}},
                {'description': {$regex: searchRegExp}}
            ]
        });
    }

    if (query.category) {
        resultQuery.$and.push({
            'category': query.category
        });
    }

    return resultQuery;
};

StockSchema.statics.byQuery = function (query, callback) {
    this.findAndPopulate(this.constructQuery(query), callback);
};

StockSchema.statics.findOneAndPopulate = function (query) {
    var self = this;

    return new Promise(function(resolve, reject) {
        self
            .findOne(query)
            .populate('company')
            .populate('category', 'id name')
            .exec(function(err, stock) {
                if (err) return reject(err);
                resolve(stock);
            });
    });
};

StockSchema.statics.findOneAndPopulate = function (query) {
    var self = this;

    return new Promise(function(resolve, reject) {
        self
            .find(query)
            .populate('company')
            .populate('category', 'id name')
            .exec(function(err, stocks) {
                if (err) return reject(err);
                resolve(stocks);
            });
    });
};

/*  Преобразование в JSON  */

StockSchema.methods.toJSON = function (userID) {
    var stockJSON = {
        id: this._id,
        name: this.name,
        description: this.description,
        logo: this.logo,
        thumb: this.thumb,
        startDate: this.startDate,
        endDate: this.endDate,
        company: this.company,
        category: this.category,
        subscribes: this.subscribes
    };

    if (userID) {
        var subscribed = this.isSubscribed(userID);
        stockJSON.subscribed = subscribed;
        stockJSON.subscribes = this.getSubscribersIDs();

        if (subscribed)
            stockJSON.code = this.getSubscriptionCode(userID);
    }

    return stockJSON;
};

/* Вспомогательные методы */

StockSchema.methods.checkOwner = function (companyID) {
    return (this.company.toString() == companyID.toString()) ||
        (this.company._id == companyID.toString());
};


StockSchema.methods.prepareRemove = function (callback) {
    var subscribers = this.subscribes;
    var self = this;
//TODO: переписать на контроллер
    this.removeImages((err) => {
        if (err) {
            callback(err);
            return;
        }

        var Client = mongoose.model('Client');

        Client.find({_id: {$in: subscribers}}, (err, clients) => {
            if (err) {
                callback(err);
                return;
            }

            clients.forEach((client) => {
                client.unsubscribe(self._id.toString())
            });

            callback(null, 'ok');
        });
    });
};



StockSchema.pre('save', function (next) {
    Shappy.logger.info('Сохраняю акцию ' + this._id);
    next();
});
mongoose.model('Stock', StockSchema);

Shappy.logger.info('Подключил модель Stock');
