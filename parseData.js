var http;
if (process.env.API_SERVER_HTTPS == 1){
	http = require('https');
}
else{
	http = require('http');
}

var querystring = require('querystring');

var store_id_array = [];
var store_name_array = [];
var cl_player_id_array = [];

var token_file_name = process.env.TOKEN_FILE_NAME;
var playerList_file_name = process.env.PLAYER_LIST_FILE_NAME;
var input_file_name = process.env.INPUT_FILE_NAME
var token = 'aaaaaaaaa';
var api_server = process.env.API_SERVER;
var testjson = {
  'token' : token,
  'itemId' : 'sim1',
  'action': 'sell',
  'amount': 50,
  'player_id' : 'test01',    
}

var postData = JSON.stringify(testjson);
var options = {
  hostname: api_server,
  path: '/Engine/rule',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length
  }
};

var fs = require('fs');

var players_file = fs.readFileSync(playerList_file_name).toString().split("\n");

for(i in players_file) {
	var line_array = players_file[i].split(",");
    for(j in line_array) {
		var sub_array = line_array[j].split(":");
		if (sub_array[0] == "id"){
			store_id_array.push(sub_array[1]);
		}else if (sub_array[0] == "name"){
			store_name_array.push(sub_array[1]);
		}else if (sub_array[0] == "player_id"){
			cl_player_id_array.push(sub_array[1]);
		}
			
	}
}
for (i in store_id_array){
	console.log("Id : " + store_id_array[i] + " Name : " + store_name_array[i]+ " Player id : " + cl_player_id_array[i]);	
}
function getPlayerIdByStoreName (store_name){
	for (n in store_id_array){
		if (store_name == store_name_array[n]){
			return cl_player_id_array[n];
		}
	}
	return null;
}
//  ********************* Get Token  **********************************************//
token = fs.readFileSync(token_file_name).toString();


//  *********************  parse data here  **********************************************//
var input_file = fs.readFileSync(input_file_name).toString().split("\n");
for (line in input_file){
	
	var input_line = input_file[line].split(",");
	console.log("Line : " +input_line);
	var player_id;
	var amount;
	var date="now";
    for(j in input_line) {
		var sub_array = input_line[j].split(":");
		if (sub_array[0] == "store"){
			player_id = getPlayerIdByStoreName(sub_array[1]);
		}else if (sub_array[0] == "amount"){
			amount = sub_array[1];
		}else if (sub_array[0] == "date"){
			date = sub_array[1];
		}	
	}	
	console.log("player_id : " + player_id + " amount : " + amount + " date : " + date);
	engine_rule(player_id,amount, date);
}


// ***************************  Engine rule **************************************************//

function engine_rule( player_id, amount, date){
	
	testjson['token'] = token;
	console.log(token);
	testjson['player_id'] = player_id;
	testjson['amount'] = amount;
	postData = querystring.stringify(testjson);
	
	console.log(postData);
	options.headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': postData.length,
		'Date' : date
	}
	//console.log("postdata = " + postData);
	var req = http.request(options, function(res) {
		console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
		});
		res.on('end', function() {
			//console.log('No more data in response.')
		})
	});
	
	
	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});
	
	req.write(postData);
	req.end();

}

