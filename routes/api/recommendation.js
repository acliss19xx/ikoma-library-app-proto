var express = require('express');
var router = express.Router();
var api = require('./recommendation/get_list.js');

router.get('/', function(req, res, next) {
    console.log('before get_booklist()');
    api.get_booklist(req, res);
    console.log('after get_booklist()');
});

module.exports = router;
