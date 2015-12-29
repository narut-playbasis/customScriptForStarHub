var http;
var url_title;
if (process.env.API_SERVER_HTTPS == 1){
	http = require('https');
	url_title = "https://";
}
else{
	http = require('http');
	url_title = "http://";
}

var data = '';
var querystring = require('querystring');

var host = process.env.API_SERVER;
var apiKey = process.env.API_KEY;
var path = '/StoreOrg/nodes';


//console.log("http://" + host + path + "?api_key=" + apiKey);
http.get(url_title + host + path + "?api_key=" + apiKey, function(res) {
	//console.log("Got response: " + res.statusCode);
	res.setEncoding('utf8');
	data = '';
	res.on('data', function (chunk) {
	data += chunk

	});
	// consume response body
	res.resume();
	res.on('end', function(){
	var obj = JSON.parse(data);
	var results = obj.response['results'];
	//console.log('response: ' + results);
	for (var key in results){
		var result = results[key];
		for (var attr_name in result ){
			if (attr_name == "name" || attr_name == "_id")
			{
				process.stdout.write(attr_name + ":" + result[attr_name]+",");
			}
		}
		console.log("");
	}
});
  
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});