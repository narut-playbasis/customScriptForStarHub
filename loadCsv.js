var numeral = require('numeral');

var storeName_str = "storeName";
var itemList_price = [8,17,18,25,28,50];
var total_str = "total";
var totalQty_str = "totalQty";
var numeral = require('numeral');

var input_file_name = process.env.CSV_INPUT_FILE_NAME;

var columns = [];
columns.push(storeName_str);
for (var i in itemList_price){
    columns.push(itemList_price[i]);
}
columns.push(total_str);
columns.push(totalQty_str);


require("csv-to-array")({
    file: input_file_name,
    columns: columns
}, function (err, array) {
    //console.log(err || array);
    var i
    for (i in array){
        if (i > 0){
            var storeInfo = array[i];
            var storeName = storeInfo[storeName_str];
            var amountList = Array();
            for (var i in itemList_price){
                var str = numeral().unformat(storeInfo[itemList_price[i]]);;
                var total = parseInt(str);
                if (total > 0){
                    //console.log("total = "+total+" price per item = "+ itemList_price[i]);
                    amountList[itemList_price[i]] = total;
                }
                else{
                    continue;
                }
            }
            for (var j in amountList){
                console.log("store:"+ storeName + ",item:"+ array[0][j] + ",amount:" + amountList[j]+",price:"+j);
            }
        }
    }
});