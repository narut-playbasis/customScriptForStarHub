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
var parent_name_array = [];
var player_id_for_acc_array = [];

var manager_player_id = [];
var manager_exp_player_id = [];
var manager_point_player_id = [];
var manager_gold_player_id = [];

var token_file_name = process.env.TOKEN_FILE_NAME;
var playerList_file_name = process.env.PLAYER_LIST_FILE_NAME;
var input_file_name = process.env.CSV_TO_TEXT_FILE_NAME
var token = 'aaaaaaaaa';
var api_server = process.env.API_SERVER;
var action_name = process.env.ACTION_NAME
var acc_action_name = process.env.ACC_ACTION_NAME;
var parameter_name = 'product-name';
var type = process.env.PARAM_TYPE;

var testjson = {
  'token' : token,
  parameter_name : 'test',
  'action': action_name,
  'amount': 50,
  'type' : type,
  'player_id' : 'test01',    
}

var jsonForManagerRule = {
    'token' : token,
    'action': acc_action_name,
    'player_id' : 'test01',
    'exp' : 0,
    'point' : 0,
    'gold' : 0,
    'qty' : 0
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
		}else if (sub_array[0] == "parent"){
			parent_name_array.push(sub_array[1]);
		}
			
	}
}
//for (i in store_id_array){
//	console.log("Id : " + store_id_array[i] + " Name : " + store_name_array[i]+ " Player id : " + cl_player_id_array[i]);
//}
function getPlayerIdByStoreName (store_name){
	for (n in store_id_array){
		if (store_name == store_name_array[n]){
			return cl_player_id_array[n];
		}
	}
	return null;
}
function getParentByStoreName (store_name){
	for (n in store_id_array){
		if (store_name == store_name_array[n]){
			return parent_name_array[n];
		}
	}
	return null;
}
function findParents(store_name){
	var parent_player_id = getPlayerIdByStoreName(store_name)
	//console.log(parent_player_id);
	if (parent_player_id == null){
		return 
	}
	else {
		player_id_for_acc_array.push(parent_player_id);
		var parent_name = getParentByStoreName(store_name);
		if (parent_name != null){
			findParents(parent_name);
		}
		
	}
}
function getParentByPlayerId (playerId){
    for (n in cl_player_id_array){
        if (playerId == cl_player_id_array[n]){
            return parent_name_array[n];
        }
    }
    return null;
}
function findParentsByPlayerId(player_id){
    var parent_name = getParentByPlayerId(player_id);
    if (parent_name != null){
        var parent_player_id = getPlayerIdByStoreName(parent_name);
        if (findParentsByPlayerId(parent_player_id) != null){
            player_id_for_acc_array.push(parent_player_id);
        }
    }
    return parent_name
}
//  ********************* Get Token  **********************************************//
token = fs.readFileSync(token_file_name).toString();


//  *********************  parse data here  **********************************************//
var input_file = fs.readFileSync(input_file_name).toString().split("\n");
var line = 0;
var index_for_manager_rule = 0;
if (process.env.GEN_CSV_ONLY != 1){
    readLine(line);
}
else{
    for (i in input_file){
        readLine(i);
    }
}


// ***************************  Engine rule **************************************************//

function engine_rule( player_id, amount,item_name, date){
	
	testjson['token'] = token;

	testjson['player_id'] = player_id;
	testjson['amount'] = amount;
    testjson[parameter_name] = item_name;
	postData = querystring.stringify(testjson);

    if (process.env.DEBUG_MODE == 1)console.log(testjson);
	options.headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': postData.length,
		'Date' : date
	}
	var req = http.request(options, function(res) {
		console.log('STATUS: ' + res.statusCode);
        var data = "";
        if (process.env.DEBUG_MODE == 1) console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
            data += chunk;
		});
		res.on('end', function() {

            if (process.env.DEBUG_MODE == 1) console.log(data);
            data = JSON.parse(data);
            if (data.message == "Success"){
                processReward(data.response,player_id);
            }
            line++;
            if (line < input_file.length){
                readLine(line);
            }
            else{
                if (process.env.DEBUG_MODE == 1)
                {
                    console.log(manager_exp_player_id);
                    console.log(manager_point_player_id);
                    console.log(manager_gold_player_id);
                    console.log(manager_player_id);
                }

                // start process reward for manager
                index_for_manager_rule = 0;
                var id = manager_player_id[index_for_manager_rule];
                rule_manager(id,manager_exp_player_id[id],manager_point_player_id[id],manager_gold_player_id[id]);
            }

		})
	});
	
	
	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});
	
	req.write(postData);
	req.end();
}
function rule_manager( player_id, exp,point,gold){

    jsonForManagerRule['token'] = token;
    jsonForManagerRule['player_id'] = player_id;

    jsonForManagerRule['exp'] = exp;
    jsonForManagerRule['point'] = point;
    jsonForManagerRule['gold'] = gold;

    jsonForManagerRule['qty'] = gold;
    postData = querystring.stringify(jsonForManagerRule);

    if (process.env.DEBUG_MODE == 1) console.log(jsonForManagerRule);
    options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length,
    }

    var req = http.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        var data = "";
        if (process.env.DEBUG_MODE == 1) console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {

            data += chunk;
        });
        res.on('end', function() {

            if (process.env.DEBUG_MODE == 1) console.log(data);
            index_for_manager_rule++;
            if (index_for_manager_rule < manager_player_id.length){
                var id = manager_player_id[index_for_manager_rule];
                rule_manager(id,manager_exp_player_id[id],manager_point_player_id[id],manager_gold_player_id[id]);
            }
        })
    });


    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(postData);
    req.end();
}


// **************************************   function ***********************************************


function readLine(index){
    var input_line = input_file[index].split(",");
    if (process.env.DEBUG_MODE == 1)  console.log("Line : " +input_line);
    var store_name= "";
    var player_id = null;
    var amount = "";
    var item_name = "";
    var date="now";
    player_id_for_acc_array = [];
    for(j in input_line) {
        var sub_array = input_line[j].split(":");
        if (sub_array[0] == "store"){
            store_name=sub_array[1];
            player_id = getPlayerIdByStoreName(store_name);
        }else if (sub_array[0] == "amount"){
            amount = sub_array[1];
        }else if (sub_array[0] == "date"){
            date = sub_array[1];
        }else if (sub_array[0] == "item"){
            item_name = sub_array[1];
        }
    }

    if (process.env.GEN_CSV_ONLY != 1){
        engine_rule(player_id,amount,item_name, date);
    }
    else{
        if (player_id == null){
            console.log('Error Store name ' + store_name + 'does not have player id associate');
        }
        var str = "action:"+action_name+","+"player_id:" + player_id + ","+parameter_name+":"+item_name+","+ "amount:" + amount + ","+"date:" + date;
        console.log(str);
    }
}
function processReward (res,player_id){
    var response = res;
    var events = response.events;
    var exp = 0;
    var point = 0;
    var gold = 0;

    for (e_index in events){
        var event = events[e_index];
        if (event.event_type == 'REWARD_RECEIVED'){
            if (event.reward_type == 'exp'){
                exp = parseInt(event.value);
            }
            else if(event.reward_type == 'point'){
                point = parseInt(event.value);
            }
            else if(event.reward_type == 'gold'){
                gold = parseInt(event.value);
            }
        }
    }
    player_id_for_acc_array = [];
    findParentsByPlayerId(player_id);
    for (var index in player_id_for_acc_array){
        collectRewardForManager(player_id_for_acc_array[index],exp,point,gold)
    }

}
function collectRewardForManager(player_id, exp,point,gold){
    if (manager_player_id.indexOf(player_id) < 0) {
        //Not in the array
        manager_player_id.push(player_id);
    }

    if (player_id in manager_exp_player_id){
        manager_exp_player_id[player_id] += exp;
    }else{
        manager_exp_player_id[player_id] = exp;
    }
    if (player_id in manager_point_player_id){
        manager_point_player_id[player_id] += point;
    }else{
        manager_point_player_id[player_id] = point;
    }
    if (player_id in manager_gold_player_id){
        manager_gold_player_id[player_id] += gold;
    }else{
        manager_gold_player_id[player_id] = gold;
    }

}
