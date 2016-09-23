var https = require('https');
var storage = require('@google-cloud/storage')();

exports.auth = function (request, response) {
	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

	if (request.method == 'OPTIONS') {
		response.send(200);
		return;
	}

// NOTE: Do not log headers or response body so no user information is retained anywhere!

	storage.bucket('ghcodex.appspot.com').file('config.json').download(function (err, data) {
//		console.log('configFile.download: err: ' + JSON.stringify(err) + '\ndata: ' + data);
		if (err) {
			console.log('config.json download err: ' + err);
			response.sendStatus(500);
			return;
		}

		var config = JSON.parse(data);
//		console.log('config: ' + JSON.stringify(config));

		var localhost = request.headers.origin ? (request.headers.origin.indexOf('localhost') != -1) : false;
		var client = localhost ? config['localhost'] : config['spiffcode.github.io'];
		var clientParms = 'client_id=' + client.id + '&client_secret=' + client.secret;
		var options = {
			hostname: 'github.com', port: 443, method: 'POST',
			path: '/login/oauth/access_token?' + clientParms + '&code=' + request.query.code
		};
		var req = https.request(options, function(res) {
			console.log('Status: ' + res.statusCode);
			res.setEncoding('utf8');
			res.on('data', function (body) {
				response.statusCode = res.statusCode;
				response.statusMessage = res.statusMessage;
				response.end(body);
			});
		});
		req.on('error', function(e) {
			console.log('problem with request: ' + e.message);
			response.sendStatus(res.statusCode);
		});
		req.end();
	});
}
