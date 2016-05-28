'use strict';

class QueryBuilder {
    /**
     * Конструирует запрос для поиска по айди
     * @param id - айди объекта для поиска
     * @returns {{_id: *}} запрос для поиска
     */
    static entityIdEqualsTo(id) {
        return {
            _id: id
        }
    }

    /**
     * Конструирует запрос для поиска совпадений по полю
     * @param field имя поля
     * @param value значение этого поля
     * @returns {{}} запрос для поиска
     */
    static fieldEqualsTo(field, value) {
        var result = {};
        result[field] = value;
        return result;
    }

    /**
     * Проверяет элементы в массиве
     * @param fieldName название поля-массива в модели
     * @param query запрос, который выполнится для каждого элемента в массиве
     * @returns {{}} запрос
     */
    static checkElementsInArray(fieldName, query) {
        var result = {};
        result[arrayField] = {$elemMatch: query};
        return result;
    }

    static valueInArray(value, array) {
        var result = {};
        result[value] = {$in: array};
        return result;
    }

    /**
     * Проверяет совпадение поля по регулярному выражению
     * @param {string} fieldName название поля в модели
     * @param {string} regExpString строковое представление регулярного выражения
     * @returns {{}} запрос
     */
    static fieldLikeRegExp(fieldName, regExpString) {
        var result = {};
        result[fieldName] = new RegExp(regExpString, 'i');
        return result;
    }

    /**
     * Конструирует запрос из нескольких запросов, в котором должен выполниться хотя бы один
     * @param запросы через запятую
     * @returns {{$or: Array}}
     */
    static some() {
        var result = {$or: []};

        for (var i = 0; i < arguments.length; i++) {
            var param = arguments[i];
            result[$or].push(param);
        }

        return result;
    }

    /**
     * Конструирует запрос из нескольких запросов, в котором должны выполниться все запросы
     * @param запросы через запятую
     * @returns {{$and: Array}}
     */
    static all() {
        var result = {$and: []};

        for (var i = 0; i < arguments.length; i++) {
            var param = arguments[i];
            result[$and].push(param);
        }

        return result;
    }
}

module.exports = QueryBuilder;