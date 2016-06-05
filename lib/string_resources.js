var Errors = {
    // Друзья
    CLIENT_ALREADY_IN_FRIENDS: 'Этот пользователь уже в друзьях',
    CLIENT_NOT_IN_FRIENDS:     'Этого пользователя нет в друзьях',

    // Акции
    STOCK_DATES_INCORRECT: 'Даты проведения акции некорректные',
    NO_SUCH_STOCK: 'Не существует акции с таким айди',
    ALREADY_SUBSCRIBED_TO_STOCK: 'Клиент уже подписан на эту акцию',
    CLIENT_NOT_SUBSCRIBED_TO_STOCK: 'Клиент не подписан на эту акцию',

    // Файлы
    IMAGE_NOT_PRESENT_IN_REQUEST: 'В запросе отсутствует изображение',

    // Компании
    NO_SUCH_COMPANY: 'Такой компании не существует',

    // Клиент
    USERNAME_ALREADY_TAKEN: 'Этот логин уже используется',
    NO_SUCH_USER: 'Такого пользователя не существует',
    INCORRECT_PASSWORD: 'Некорректный пароль',
    // Активационные коды
    NO_SUCH_ACTIVATION_CODE: 'Нет такого активационного кода',

    // Категории
    NO_SUCH_CATEGORY: 'Нет такой категории'
};

var Answers = {
    OK:            'success',
    ERROR:         'error',
    // Друзья
    ADD_FRIEND:    'addfriend',
    DELETE_FRIEND: 'deletefriend',
    ALL_FRIENDS:   'allfriends',

    // Статистика
    USERS_PER_STOCK: 'usersperstock',

    // Акции
    STOCK_INFO: 'stock_info',
    STOCK:      'stock',

    // Компании
    UNACTIVATED: 'unactivated',

    // Общие
    REGISTER: 'register',
    SUCCESS: 'success',
    USER_INFO: 'user_info'
};

var StringResources = {
    errors: Errors,
    answers: Answers
};

module.exports = StringResources;