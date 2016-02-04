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
var id_array = [];
var names_array = [];
var parent_array = [];
var organize_array=[];
var host = process.env.API_SERVER;
var apiKey = process.env.API_KEY;
var path = '/StoreOrg/players/';
var role = '&role=manager';
var nodesListFileName = process.env.NODE_LIST_FILE_NAME

var fs = require('fs');
var obj;
var nodes_list = [];

var array_file = fs.readFileSync(nodesListFileName).toString().split("\n");
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
        else if (sub_array[0] == "organize"){
            organize_array.push(sub_array[1]);
        }

    }
}
var index = 0;

getRequestPlayers(id_array[index], names_array[index], parent_array[index],organize_array[index]);
function getRequestPlayers (id, name, parent_name,organize_name){
    http.get(url_title + host + path + id +"?api_key=" + apiKey + role, function(res) {
        res.setEncoding('utf8');
        data = '';
        res.on('data', function (chunk) {
        data += chunk

    });
    // consume response body
    res.resume();
    res.on('end', function(){
        var obj = JSON.parse(data);
        var results = obj.response;
        //console.log( name + ' response: ' + results);
        for (var k in results){
            console.log("name:"+name+",id:"+id + ",player_id:" + results[k]['player_id']+ ",parent:" + parent_name + ",organize:"+organize_name);
            index++
            if (index < id_array.length){
                getRequestPlayers(id_array[index], names_array[index], parent_array[index],organize_array[index]);
            }
        }


    });

    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
}
