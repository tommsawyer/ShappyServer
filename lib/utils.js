'use strict';

var ObjectID = require('mongodb').ObjectId;

class Utils {
    /**
     * Преобразует строку, содержащую айди, к типу ObjectID.
     * Возвращает null если преобразование невозможно
     * @param id строковое представление айди
     * @returns {ObjectID} айди, преобразованный к ObjectID
     */
    static tryConvertToMongoID(id) {
        var convertedId;

        try {
            convertedId = new ObjectID(id);
        } catch (e) {
            convertedId = null;
        }

        return convertedId;
    }

    /**
     * Проверяет, попадает ли текущая дата в промежуток между двумя переданными
     * @param startDate - начальная дата интервала
     * @param endDate - конечная дата интервала
     * @returns {boolean} true если текущая дата между startDate и endDate, false иначе
     */
    static isCurrentDateBetween(startDate, endDate) {
        var currentDate = new Date();

        return startDate < currentDate && currentDate < endDate;
    }

    /**
     * Пробует распарсить строковое представление даты
     * @param date строковое представление даты
     * @returns {Date} дата или null, если распарсить невозможно
     */
    static tryParseDate(date) {
        var parsedDate = Date.parse(date);

        if (isNaN(parsedDate)) {
            return false;
        } else {
            return new Date(parsedDate);
        }
    }

    static addDaysToDate(date, days) {
        const DAY = 1000 * 60 * 60 * 24; // ms * sec * min * hour
        return new Date(date.getTime() + DAY * days);
    }
}

module.exports = Utils;