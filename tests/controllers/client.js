var app      = require('../test_server'),
    request  = require('supertest'),
    mongoose = require('mongoose');

var testUserFields = {
    login:    'testLogin',
    password: 'testPassword',
    name:     'testName',
    surname:  'testSurname',
    mail:     'test@test.com',
    phone:    '123456789'
};


var userWithIncorrectLogin = {
    login:    'asd',
    password: 'testPassword',
    name:     'testName',
    surname:  'testSurname',
    mail:     'test@test.com',
    phone:    '123456789'
};

describe('Клиент', function() {
    before(function(done) {
        if (mongoose.connection.collections.users) {
            mongoose.connection.collections.users.drop(function(err) {
                done();
            });
        } else {
            done();
        }
    });

    describe('Регистрация', function () {
        it('Не должен регистрировать пользователя если нет каких-то полей', function(done) {
            request(app)
                .post('/user/register')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Accept', 'application/json')
                .expect(500, {
                    type: 'bad request',
                    data: 'В запросе не заполнены поля: login, password, name, surname, mail, phone'
                }, done);
        });

        it('Должен регистрировать нового пользователя с корректными данными', function (done) {
            request(app)
                .post('/user/register')
                .send(testUserFields)
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Accept', 'application/json')
                .expect(function(res) {
                    res.body.data = ''
                })
                .expect(200, {
                    type: 'register',
                    data: ''
                }, done);
        });

        it('Должен запрещать создавать пользователя с занятым логином', function(done) {
              request(app)
                .post('/user/register')
                .send(testUserFields)
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Accept', 'application/json')
                .expect(500, {
                    type: 'error',
                    data: 'Этот логин уже используется'
                }, done);
        });

        it('Должен запрещать создавать пользователя если некорректный логин или пароль', function(done) {
            request(app)
                .post('/user/register')
                .send(userWithIncorrectLogin)
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Accept', 'application/json')
                .expect(500, { type: 'error', data: 'Некорректный логин' } , done);
        });
    });

    describe('Авторизация', function() {
        it('Должен авторизовывать пользователя с корректными данными', function(done) {
            request(app)
                .post('/user/authorize')
                .send({login: 'testLogin', password: 'testPassword'})
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Accept', 'application/json')
                .expect(200, done);
        });

        it('Не должен авторизовывать пользователя с неправильным логином', function(done) {
            request(app)
                .post('/user/authorize')
                .send({login: 'asd', password: 'testPassword'})
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Accept', 'application/json')
                .expect(500, {
                    type: 'error',
                    data: 'Такого пользователя не существует'
                }, done);
        });

        it('Не должен авторизовывать пользователя с неправильным паролем', function(done) {
            request(app)
                .post('/user/authorize')
                .send({login: 'testLogin', password: 'someIncorrectPassword'})
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Accept', 'application/json')
                .expect(500, {
                    type: 'error',
                    data: 'Некорректный пароль'
                }, done);
        });
    });
});