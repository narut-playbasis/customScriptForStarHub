var fs = require('fs');
var input_file_name = "Sample.csv"
var col_name = [];
var col_storeNo_str = "Storeno.";
var col_total_str = "Total$";
var col_totalQty_str = "TotalQty";

var store_name = [];
var lookup_table = Array();

var input_file = fs.readFileSync(input_file_name).toString().split("\n");
var line_number;
for (line in input_file){
    line_number = line + 1;
    var input_line = input_file[line].split(",");
    var col;
    if (line_number == 1){

        for (col in input_line){
            var str = input_line[col];//input_line[col].replace(/\s/g, '');
            if ((str == col_storeNo_str) || (str == col_total_str) || (str == col_totalQty_str)) {
                lookup_table[col] = str;
            }
            else {
                str = input_line[col];
                while (str.charAt(0) == ' '){
                    str = str.substr(1)
                }
                lookup_table[col] = str;
            }
            process.stdout.write(str+",");
        }
    }
    break;

}
