'use strict';

class QueryBuilder {

    /**
     * Возвращает запрос для поиска по айди
     * @param id - айди объекта для поиска
     * @returns {{_id: *}}
     */
    static entityIdEqualsTo(id) {
        return {
            _id: id
        }
    }
}

module.exports = QueryBuilder;