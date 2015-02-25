/**
 * Created by root on 25.02.15.
 */
/**
 * Created by esteves on 25.02.15.
 */
var check, t1, t2, prefix, sufx, newline;
var fs = require('fs');
var indexs = [];
fs.unlinkSync('./output.txt');
fs.readFileSync('./texto.txt').toString().split('\n').forEach(function (line) {j=0;check = line.toString().indexOf(".put(");
    if (check != -1) {for (var i = 0; i < line.length; i++){if ((line.substring(i,i+1) == "\"") && (line.substring(i-1,i) != "\\")) {indexs[j]=i; j++;}}
        if (j==4){prefix=line.toString().substring(1,indexs[0]);sufx=line.toString().substring(indexs[3],line.length);t1=line.toString().substring(indexs[0],indexs[1]);t2=line.toString().substring(indexs[2],indexs[3]+1);newline = prefix + t2 + ", " + t1 + sufx;
            fs.appendFileSync('./output.txt', newline.toString() + "\n");}}
    else {fs.appendFileSync('./output.txt', line.toString() + "\n");}}); process.exit(0);
