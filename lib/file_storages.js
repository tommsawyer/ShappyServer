'use strict';

var multer = require('multer'),
    mime   = require('mime'),
    SHA256 = require('crypto-js/sha256');

const PATH_TO_COMPANIES_IMAGES = '/../public/companies',
      PATH_TO_STOCK_IMAGES     = '/../public/stocks';

var generateFuncForDestinationFolder = function (destination) {
    return function (req, file, cb) {
        cb(null, __dirname + destination);
    }
};

var generateFileName = function (req, file, cb) {
    cb(null, SHA256(file.fieldname + Date.now()) + '.' + mime.extension(file.mimetype))
};

var FileStorages = {
    companyStorage: multer.diskStorage({
        destination: generateFuncForDestinationFolder(PATH_TO_COMPANIES_IMAGES),
        filename:    generateFileName
    }),

    stockStorage: multer.diskStorage({
        destination: generateFuncForDestinationFolder(PATH_TO_STOCK_IMAGES),
        filename:    generateFileName
    })
};

module.exports = {
    saveCompanyLogoFromField: multer({storage: FileStorages.companyStorage}),
    saveStockImageFromField:  multer({storage: FileStorages.stockStorage})
};
