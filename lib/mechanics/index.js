module.exports = {
    Client: {
        Friends:    require('./client/friends'),
        Stocks:     require('./client/stock'),
        Subscribes: require('./client/subcribes')
    },

    Company: {
        Activation: require('./company/activation'),
        Images:     require('./company/images'),
        Mail:       require('./company/mail'),
        Subscribes: require('./company/subscribes')
    },

    Stock: {
        Images:     require('./stock/images'),
        Usages:     require('./stock/usages'),
        Subscribes: require('./stock/subcribes'),
        Views:      require('./stock/views')
    }
};