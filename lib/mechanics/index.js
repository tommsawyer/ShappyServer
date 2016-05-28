module.exports = {
    Client: {
        FriendsController:    require('./client/friends'),
        StocksController:     require('./client/stock'),
        SubscribesController: require('./client/subcribes'),
        CompaniesController:  require('./client/company'),
        CategoriesController: require('./client/category')
    },

    Company: {
        ActivationController: require('./company/activation'),
        ImagesController:     require('./company/images'),
        MailController:       require('./company/mail'),
        SubscribesController: require('./company/subscribes')
    },

    Stock: {
        ImagesController:     require('./stock/images'),
        UsagesController:     require('./stock/usages'),
        SubscribesController: require('./stock/subcribes'),
        ViewsController:      require('./stock/views')
    }
};