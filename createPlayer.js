var http;
if (process.env.API_SERVER_HTTPS == 1){
	http = require('https');
}
else{
	http = require('http');
}

var querystring = require('querystring');


var id_array = [];
var names_array = [];
var parent_array = [];

var token_file_name = process.env.TOKEN_FILE_NAME;
var node_file_name = process.env.NODE_LIST_FILE_NAME;

var token = 'aaaaaaaaa';
var api_server = process.env.API_SERVER;
var action_name = process.env.ACTION_NAME
var acc_action_name = process.env.ACC_ACTION_NAME;
var workDone = false;
var testjson = {
  'token' : token,
  'username' : 'startHubUsername',
  'email': 'startHubEmail',
  'image': 'https://randomuser.me/api/portraits/thumb/men/99.jpg',
  'first_name' :'startHubFirstName',
  'last_name' :'Sven',
  'password' : '12345678'
}

var jsonForAddPlayer = {
    'token' : token,
    'node_id' : 'node_id',
    'player_id': 'test001'
}

var jsonForSetRole = {
    'token' : token,
    'node_id' : 'node_id',
    'player_id': 'test001',
    'role' : 'manager'
}

var postData = JSON.stringify(testjson);
var options = {
  hostname: api_server,
  path: '/Player',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length
  }
};

var fs = require('fs');

var array_file = fs.readFileSync(node_file_name).toString().split("\n");
for(i in array_file) {
	var line_array = array_file[i].split(",");
	for(j in line_array) {
		var sub_array = line_array[j].split(":");
		if (sub_array[0] == "_id"){
			id_array.push(sub_array[1]);
		}else if (sub_array[0] == "name"){
			names_array.push(sub_array[1]);
		}else if (sub_array[0] == "parent"){
			parent_array.push(sub_array[1]);
		}
	}
}


//  ********************* Get Token  **********************************************//
token = fs.readFileSync(token_file_name).toString();
console.log("token = "+token);

//  *********************  parse node here  **********************************************//
var index = 0;

function getPlayerId (index){
    var player_id = names_array[index];
    if (parent_array[index] == "7-11"){
        player_id = 'dm_'+player_id;
    }
    console.log('player_id:'+player_id);
    return player_id;
}
function getNodeId (index){
    var node_id = id_array[index];
    return node_id;
}


createPlayer(getPlayerId(index));


// ***************************  create player **************************************************//

function createPlayer( player_id){

	testjson['token'] = token;
	testjson['username'] = player_id;
	testjson['email'] = player_id+'@playbasis.com';
    testjson['first_name'] = player_id;

    var local_index = index % 100;
    testjson['image'] = 'https://randomuser.me/api/portraits/thumb/men/' + local_index +'.jpg'
	postData = querystring.stringify(testjson);
	
	console.log(postData);
    options.path = '/Player/' + player_id + '/register';
	options.headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': postData.length,
	};

    //console.log(options);
	var req = http.request(options, function(res) {
		console.log('STATUS: ' + res.statusCode);
		//console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('BODY: ' + chunk);
		});
		res.on('end', function() {
			console.log('No more data in response.')
            addPlayerToNode(player_id,getNodeId(index));
		})
	});
	
	
	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});

	req.write(postData);
	req.end();

}

function addPlayerToNode( player_id,node_id){

    jsonForAddPlayer['token'] = token;
    postData = querystring.stringify(jsonForAddPlayer);

    console.log(postData);
    options.path = '/StoreOrg/nodes/' + node_id + '/addPlayer/' + player_id;
    options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length,
    };

    //console.log(options);
    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
        res.on('end', function() {
            setRole(player_id,node_id);
        })
    });


    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(postData);
    req.end();

}
function setRole( player_id,node_id){

    jsonForSetRole['token'] = token;
    postData = querystring.stringify(jsonForSetRole);

    console.log(postData);
    options.path = '/StoreOrg/nodes/' + node_id + '/setPlayerRole/' + player_id;
    options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length,
    };

    //console.log(options);
    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
        res.on('end', function() {
            index++;
            if (index < names_array.length){
                createPlayer(getPlayerId(index));
            }
        })
    });


    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(postData);
    req.end();

}

