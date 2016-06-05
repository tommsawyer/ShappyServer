'use strict';

var fs        = require('fs'),
    JSONError = require('./json_error');

const PATH_TO_LOG_FILE = __dirname + '/../logs/log.txt';

class Logger {
    constructor() {
        this.logFile = PATH_TO_LOG_FILE;

        // если файла не существует, создадим его
        if (!fs.existsSync(PATH_TO_LOG_FILE)) {
            fs.writeFileSync(PATH_TO_LOG_FILE, '');
        }
    }

    setSilent(silent) {
        this.silent = silent;
    }

    /**
     * Записывает в лог информационное сообщение
     * @param message {string} строка с сообщением
     */
    info(message) {
        this._printMessage('(INFO) ' + message);
    }

    /**
     * Записывает в лог предупреждающее сообщение
     * @param message {string} строка с сообщением
     */
    warn(message) {
        this._printMessage('(WARN) ' + message);
    }

    /**
     * Записывает в лог ошибку
     * @param err {Error} объект ошибки(Error, JSONError или строка)
     */
    error(err) {
        if (err instanceof JSONError) {
            this._printMessage('(ERROR!) ' + err.message + ' [' + err.code + ', ' + err.type + ']' );
        } else {
            if (err instanceof Error) {
                this._printMessage('(ERROR!) ' + err.message + '\n' + err.stack.split('\n').slice(1).join('\n'));
            } else {
                this._printMessage('(ERROR!) ' + err);
            }
        }
    }

    /**
     * Записывает в лог развернутое представление объекта
     * @param msg сообщение, которое предваряет представление объекта
     * @param obj объект для записи в лог
     */
    inspect(msg, obj) {
        this.info(msg + ' ' + this._inspect(obj));
    }

    /**
     * Очищает лог-файл
     */
    clearLog() {
        fs.writeFile(this.logFile, '', (err) => {
            if (err) throw err;
         });
    }

    /**
     * Возвращает строку с текущим временем
     * @returns {string} строка с текущем временем
     * @private
     */
    _getTime() {
        return new Date().toTimeString().split(' ')[0]
    }

    /**
     * Записывает сообщение в лог-файл и stdout
     * @param message строковое сообщение
     * @private
     */
    _printMessage(message) {
        if (!this.silent) {
            var msg = this._getTime() + ' -- ' + message;
            fs.appendFile(this.logFile, msg + '\n', (err) => {
                if (err) throw err;
            });
            console.log(msg);
        }
    }

    /**
     * Проверяет, является ли параметр объектом
     * @param obj объект для проверки
     * @returns {boolean} true если это объект, false иначе
     * @private
     */
    _isObject(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }

    /**
     * Возвращает развернутое строковое представление объекта
     * @param obj объект
     * @returns {string} строковое представление объекта
     * @private
     */
    _inspect(obj) {
        var result = "{";

        for (var key in obj) {
            if (this._isObject(obj[key])) {
                result += key + ': ' + this._inspect(obj[key]);
            } else if (obj[key] instanceof Array) {
                result += key + ': [';
                obj[key].forEach((element) => {
                    result += this._inspect(element) + ', ';
                });
                result += '] ';
            } else {
                result += key + ': ' + obj[key] +'; ';
            }
        }
        result += '}';
        return result;
    }

}

module.exports = Logger;