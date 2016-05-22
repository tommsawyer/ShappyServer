var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectID  = require('mongodb').ObjectID;
var JSONError = require('../lib/json_error');

var CategorySchema = new Schema({
    name: String,
    parentCategory: Schema.Types.ObjectId
});

CategorySchema.methods.toJSON = function (){
    return {
        name: this.name,
        parentCategory: this.parentCategory
    }
};

CategorySchema.statics.createJsonFromAllCategories = function() {
    return new Promise(function(resolve, reject) {

    });
};

CategorySchema.statics.findCategoryByID = function(categoryID) {
    if (typeof categoryID === 'string') {
        try {
            categoryID = new ObjectID(categoryID);
        } catch (e) {
            return Promise.reject(new JSONError('error', 'Некорректный айди'));
        }
    }

    return new Promise(function(resolve, reject) {
        this.find({_id: categoryID}, function(err, category) {
            if (err) return reject(err);
            resolve(category);
        });
    });
};

CategorySchema.statics.toJSON = function (callback) {
    this.find({}, (err, categories) => {
        if (err) {
            callback(err);
        }

        var byParent = function (data, parent) {
            var arrayCopy = data.slice(0);

            return arrayCopy.filter(function (element) {
                return element.parentCategory == parent;
            }).map(function (el) {
                return {
                    id: el._id,
                    name: el.name
                }
            });
        };

        var parseData = function (data, parent) {
            var result = byParent(data, parent);

            result.forEach(function (element) {
                element.children = parseData(data, element.id.toString());
            });

            return result;
        };

        callback(null, parseData(categories, undefined));
    });
};

mongoose.model('Category', CategorySchema);
Shappy.logger.info('Подключил модель категорий');
