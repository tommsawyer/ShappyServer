var mongoose  = require('mongoose');
var fs        = require('fs');
var ObjectID  = require('mongodb').ObjectID;
var gm        = require('gm').subClass({imageMagick: true});
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

StockSchema.statics.promisedFindOne = function(query) {
    var self = this;

    return new Promise(function (resolve, reject) {
        self.findOne(query, (err, stock) => {
            if (err) return reject(err);

            if (!stock) {
                return reject(new JsonError('error', StringResources.errors.NO_SUCH_STOCK));
            }

            resolve(stock);
        });
    });
};

/* Подписки */

StockSchema.statics.generateSubscription = function(userID) {
    var code = Math.round(Math.random() * 10e9).toString();
    Shappy.logger.info('Сгенерировал код подписки на акцию: ' + code);
    return {
        id: userID,
        date: new Date(),
        code: code,
        numberOfUses: 0
    }
};

StockSchema.methods.getSubscribersIDs = function() {
    return this.subscribes.map( (subscr) => {return subscr.id});
};

StockSchema.methods.getSubscriptionDates = function() {
    return this.subscribes.map((subscr) => {return subscr.date});
};

StockSchema.methods.getSubscriptionCode = function(userID) {
    var pos = this.getSubscribersIDs()
        .map((id) => {return id.toString()})
        .indexOf(userID.toString());

    if (pos == -1) return null;
    return this.subscribes[pos].code;
};

StockSchema.methods.addSubscriber = function (id, callback) {
    var ArchivedSubscription = mongoose.model('ArchivedSubscription');

    if (this.isSubscribed(id)) {
        callback(new JSONError('error', 'Вы уже подписаны на эту акцию!'));
    } else {
        ArchivedSubscription.lookPreviousSubscriptions(id, this._id, (err, archievedSubscriptions) => {
            if (err) return callback(err);

            if (archievedSubscriptions.length == 0) {
                Shappy.logger.info('Предыдущих подписок не найдено. Создаю новую');
                var subscription = this.constructor.generateSubscription(id);
                this.subscribes.push(subscription);
                this.save();
                callback(null, subscription);
            } else {
                Shappy.logger.info('Найдены предыдущие подписки. Восстанавливаю из архива данные');
                var newestSubscription = ArchivedSubscription.newest(archievedSubscriptions);

                var subscription = {
                    id: id,
                    date: new Date(),
                    numberOfUses: newestSubscription.numberOfUses,
                    code: newestSubscription.code
                };

                this.subscribes.push(subscription);
                this.save();
                callback(null, subscription);
            }
        });
    }
};

StockSchema.methods.incrementNumberOfUses = function (code) {
    for (var i=0; i < this.subscribes.length; i++) {
        if (this.subscribes[i].code == code) {
            this.subscribes[i].numberOfUses.push(new Date());
            this.save();
            return true;
        }
    }

    return false;
};

StockSchema.methods.getUserByCode = function(code, callback) {
    var Client = mongoose.model('Client');

    this.subscribes.forEach((subscr) => {
       if (subscr.code == code) {
           Client.findOne({_id: subscr.id}, (err, client) => {
               if (err) return callback(err);

               callback(null, client.toJSON());
           });
       }
    });
};

StockSchema.methods.removeSubscriber = function (userID, callback) {
    var pos = this.getSubscribersIDs()
        .map((id) => {return id.toString()})
        .indexOf(userID.toString());
    var ArchivedSubscription = mongoose.model('ArchivedSubscription');

    if (pos == -1) {
        callback(new JSONError('error', 'Юзер не подписан на эту акцию'));
        return;
    }

    ArchivedSubscription.archive(this.company, this._id, this.subscribes[pos]);

    this.subscribes.splice(pos, 1);
    Shappy.logger.info('Удаляю подписчика от акции ' + this._id);
    this.save();
    callback(null);
};

StockSchema.methods.isSubscribed = function (userID) {
    return this.subscribes.map((subscr) => {return subscr.id.toString()}).indexOf(userID.toString()) != -1;
};

/* Изображения */

StockSchema.methods.createImages = function (file) {
    if (!file) {
        this.logo = '';
        this.thumb = '';
        return;
    }

    this.logo = '/stocks/' + file.filename;
    this.thumb = '/stocks/' + file.filename.split('.')[0] + '_thumb.' + file.filename.split('.')[1];

    this.createThumbnail(file.filename);
};

StockSchema.methods.createThumbnail = function (pathToImage) {
    const THUMBNAIL_WIDTH = 480;

    var self = this;
    var dividedFileName = pathToImage.split('.');
    var fileName        = dividedFileName[0];
    var fileExtension   = dividedFileName[1];

    var thumbnailFilename = __dirname +
        '/../public/stocks/' +
        fileName +
        '_thumb.' +
        fileExtension;

    gm(__dirname + '/../public/stocks/' + pathToImage)
        .resize(THUMBNAIL_WIDTH)
        .write(thumbnailFilename, function (err) {
            if (err) {
                Shappy.logger.error(err);
                return;
            }

            Shappy.logger.info('Создал и сохранил тамбнейл для акции ' + self._id);
        });
};

StockSchema.methods.removeImages = function (callback) {
    var imgPath = __dirname + '/../public' + this.logo;
    var thumbPath = __dirname + '/../public' + this.thumb;
    var self = this;

    fs.unlink(imgPath, (err) => {
        var Client = mongoose.model('Client');
        if (err) {
            callback(err);
            return;
        }

        Shappy.logger.info('Удалил логотип акции ' + self._id);

        fs.unlink(thumbPath, (err) => {
            if (err) {
                callback(err);
                return;
            }

            Shappy.logger.info('Удалил тамбнейл акции ' + self._id);
            callback(null);
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

StockSchema.statics.byCompanyID = function (companyID, callback) {
    this.findAndPopulate({'company': companyID}, callback);
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

StockSchema.statics.findOneAndPopulate = function (query, callback) {
    this
        .findOne(query)
        .populate('company')
        .populate('category', 'id name')
        .exec(callback);
};

StockSchema.statics.findAndPopulate = function (query, callback) {
    this
        .find(query)
        .populate('company')
        .populate('category', 'id name')
        .exec(callback);
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

StockSchema.statics.arrayToJSON = function(stocks, userID) {
    return stocks.map((stock) => {return stock.toJSON(userID)});
};

/* Вспомогательные методы */

StockSchema.methods.checkOwner = function (companyID) {
    return (this.company.toString() == companyID.toString()) ||
        (this.company._id == companyID.toString());
};

StockSchema.methods.getSubscribesByDays = function* () {
    var filteredSubcribes = {};

    this.subscribes.forEach(function(subscribe) {
        var subscribeDay = subscribe.date.toDateString();
        filteredSubcribes[subscribeDay] = filteredSubcribes[subscribeDay] || [];
        filteredSubcribes[subscribeDay].push(subscribe);
    });

    for (var subcribeDay in filteredSubcribes)
    {
        yield {
            day: subcribeDay,
            subcribes: filteredSubcribes[subcribeDay]
        }
    }
};

StockSchema.methods.prepareRemove = function (callback) {
    var subscribers = this.subscribes;
    var self = this;

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

StockSchema.methods.getNumberOfUses = function () {
    return this.subscribes.reduce((totalUsesAmount, subscribe) => {
        return totalUsesAmount + subscribe.numberOfUses.length;
    }, 0);
};

StockSchema.methods.getNumberOfReUses = function() {
   return this.subscribes.filter((subscribe) => {
       return subscribe.numberOfUses.length > 1;
   }).length
};

StockSchema.methods.getSubscribesCount = function() {
    return this.subscribes.length;
};

StockSchema.methods.incrementNumberOfViews = function() {
    this.views = this.views + 1 || 1;
    Shappy.logger.info('Увеличиваю счетчик просмотров у акции');
    this.save();
};

StockSchema.methods.incrementNumberOfViewsInFeed = function() {
    this.viewsInFeed = this.viewsInFeed + 1 || 1;
    this.save();
};

StockSchema.statics.incrementFeedViewsInArray = function(stocks) {
    stocks.forEach((stock) => {
        stock.incrementNumberOfViewsInFeed();
    });
};

StockSchema.pre('save', function (next) {
    Shappy.logger.info('Сохраняю акцию ' + this._id);
    next();
});
mongoose.model('Stock', StockSchema);

Shappy.logger.info('Подключил модель Stock');
