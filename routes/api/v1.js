var express = require('express');
var https = require('https');
var util = require('util');
var router = express.Router();

router.get('/', function(req, res, next) {
    var options = {
	host: 'app.rakuten.co.jp',
	port: 443,
	path: '/services/api/BooksBook/Search/20130522?' +
	    "applicationId=" + process.env.RAKUTEN_APP_ID + "&" + req._parsedUrl.query,
	method: 'GET'
    };
    https.request(options, function(r) {
	console.log('options.path: ' + options.path);
	//console.log('STATUS: ' + r.statusCode);
	//console.log('HEADERS: ' + JSON.stringify(r.headers));
	r.setEncoding('utf8');
	var json = '';
	r.on('data', function(chunk) {
	    json += chunk;
	});
	r.on('end', function() {
	    var ret = {"Items": []};
	    var body = JSON.parse(json);
	    if (typeof body.Items === 'undefined') {
		res.send('none');
	    } else {
		ret.Items = new Array(body.Items.length);
		for (i = 0; i < body.Items.length; i++) {
		    ret.Items[i] = {title: body.Items[i].Item.title, mediumImageUrl: body.Items[i].Item.mediumImageUrl};
		}
		res.json(util.format('%j', ret));
	    }
	});
    }).end();
});

module.exports = router;
