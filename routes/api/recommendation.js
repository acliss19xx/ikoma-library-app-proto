var express = require('express');
var router = express.Router();
var api = require('./recommendation/recombook-ikoma/sandbox/get-list/routes/get_list.js');

router.get('/', function(req, res, next) {
    console.log('before get_booklist()');
    api.get_booklist(res);
    console.log('after get_booklist()');
});

module.exports = router;
