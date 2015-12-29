var http;
if (process.env.API_SERVER_HTTPS == 1){
	http = require('https');
	//console.log("https");
}
else{
	http = require('http');
	//console.log("http");
}
var querystring = require('querystring');

var api_server = process.env.API_SERVER;
var api_key = process.env.API_KEY;
var api_secret = process.env.API_SECRET;
var data = '';
var testjson = {
  'api_key' : api_key,
  'api_secret' : api_secret 
}
var postData = querystring.stringify(testjson);
var options = {
  hostname: api_server,
  path: '/Auth',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length
  }
};

//console.log("api_key = " + api_key);
//console.log("api_secret = " + api_secret);

// ***************************  Auth **************************************************//

function auth(){
	
	var req = http.request(options, function(res) {
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

