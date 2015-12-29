var http;
if (process.env.API_SERVER_HTTPS == 1){
	http = require('https');
}
else{
	http = require('http');
}

var querystring = require('querystring');

var api_key = 'api_key' | process.env.API_KEY;
var api_secret = 'api_secret' | process.env.API_SECRET;
var data = '';
var testjson = {
  'api_key' : '2683567003',
  'api_secret' : 'a27624468a30e220076cb5c3d037c420' 
}
var postData = querystring.stringify(testjson);
var options = {
  hostname: 'api.app',
  path: '/Auth',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length
  }
};



// ***************************  Auth **************************************************//

function auth(){
	
	var req = require('http').request(options, function(res) {
		//console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			data += chunk;
			//console.log('BODY: ' + chunk);
		});
		res.on('end', function() {
			var obj = JSON.parse(data);
			var token = obj.response['token'];
			process.stdout.write(token);
		})
	});
	
	
	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});
	
	req.write(postData);
	req.end();

}
auth();

