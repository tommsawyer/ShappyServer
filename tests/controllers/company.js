var app      = require('../test_server'),
    request  = require('supertest'),
    mongoose = require('mongoose');

describe('Компания', function() {
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
        it('Не должен регистрировать компанию с незаполненными полями', function(done) {
            request(app)
                .post('/company/register')
                .set('Accept', 'application/json')
                .expect(500, {
                    type: 'bad request',
                    data: 'В запросе не заполнены поля: login, password, category'
                } , done);
        });

        it('Не должен регистрировать компанию без изображения', function(done) {
            request(app)
                .post('/company/register')
                .send('login=testLogin&password=testPassword&category=asdf')
                .set('Accept', 'application/json')
                .expect(500, {
                    type: 'register',
                    data: 'В запросе отсутствует изображение'
                }, done);
        });

        it('Должен регистрировать компанию с правильными полями', function(done) {
            request(app)
                .post('/company/register')
                .field('login', 'testLogin')
                .field('password', 'testPassword')
                .field('category', 'testCategory')
                .attach('logo', __dirname + '/../test_image.png')
                .set('Accept', 'application/json')
                .expect(200, {
                    type: 'register',
                    data: 'success'
                }, done);
        });

        it('Не должен регистрировать компанию с занятым логином', function(done) {
            request(app)
                .post('/company/register')
                .field('login', 'testLogin')
                .field('password', 'testPassword')
                .field('category', 'testCategory')
                .attach('logo', __dirname + '/../test_image.png')
                .set('Accept', 'application/json')
                .expect(500, {
                    type: 'error',
                    data: 'Этот логин уже используется'
                }, done);
        });
    });

    describe('Авторизация', function() {
        it('Не должен авторизовывать компанию с неактивированным е-мейлом', function(done) {
            request(app)
                .post('/company/authorize')
                .send({login: 'testLogin', password: 'testPassword'})
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Accept', 'application/json')
                .expect(function(res) {
                    res.body.data = '';
                })
                .expect(403, {
                    type: 'unactivated',
                    data: ''
                }, done);
        });

        it('Не должен авторизовывать несуществующую компанию', function(done) {
            request(app)
                .post('/company/authorize')
                .send({login: 'someIncorrectLogin', password: 'testPassword'})
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Accept', 'application/json')
                .expect(500, {
                    type: 'error',
                    data: 'Такой компании не существует'
                }, done);
        });

        it('Не должен авторизовывать компанию с неправильным паролем', function(done) {
            request(app)
                .post('/company/authorize')
                .send({login: 'testLogin', password: 'someIncorrectPassword'})
                .set('Content-Type', 'application/x-www-form-urlencoded')
                .set('Accept', 'application/json')
                .expect(500, {
                    type: 'error',
                    data: 'Некорректный пароль'
                }, done);
        });

        describe('Активированная компания', function() {
            before(function(doneBefore) {
                var Company = mongoose.model('Company');
                Company.findOne({'login': 'testLogin'} , function(err, company) {
                    company.activationHash = 'activationHash';
                    company.save(function(err) {
                        doneBefore();
                    })
                });
            });

            it('Должен активировать компанию', function(done) {
                request(app)
                    .get('/company/activate?hash=activationHash')
                    // ожидаем редиректа на клиентское приложение(302 - редирект)
                    .expect(302, done);
            });

            it('Должен авторизовывать активированную компанию', function(done) {
                request(app)
                    .post('/company/authorize')
                    .send({login: 'testLogin', password: 'testPassword'})
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    .set('Accept', 'application/json')
                    .expect(function(res) {
                        res.body.data = '';
                    })
                    .expect(200, {
                        type: 'token',
                        data: ''
                    }, done);
            });
        });
    });
});