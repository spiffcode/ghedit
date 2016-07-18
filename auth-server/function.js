var https = require('https');

exports.auth = function (request, response) {
	// TODO: move these to a config file and reset the client secrets
	// https://github.com/organizations/spiffcode/settings/applications/356856
	var LOCALHOST_CLIENT_ID = '60d6dd04487a8ef4b699';
	var LOCALHOST_CLIENT_SECRET = '685d547286d7a983a68cd4f9dde8943515a7affd';
	// https://github.com/organizations/spiffcode/settings/applications/354499
	var GITHUB_CLIENT_ID = 'bbc4f9370abd2b860a36';
	var GITHUB_CLIENT_SECRET = '9aea005378d783e692332bf1bd1e6ca696c8a8b2';

	response.setHeader('Access-Control-Allow-Origin', '*');
	response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

	if (request.method == 'OPTIONS') {
		response.send(200);
		return;
	}

	console.log('ghauth ' + JSON.stringify(request.headers));
	var localhost = request.headers.origin ? (request.headers.origin.indexOf('localhost') != -1) : false;
	console.log('localhost: ' + localhost);
	var client = 'client_id=' + (localhost ? LOCALHOST_CLIENT_ID : GITHUB_CLIENT_ID) + 
			'&client_secret=' + (localhost ? LOCALHOST_CLIENT_SECRET : GITHUB_CLIENT_SECRET);
	var options = {
		hostname: 'github.com', port: 443, method: 'POST',
		path: '/login/oauth/access_token?' + client + '&code=' + request.query.code
	};
	var req = https.request(options, function(res) {
		console.log('Status: ' + res.statusCode);
		res.setEncoding('utf8');
		res.on('data', function (body) {
			console.log('Body: ' + body);
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
}
