/**
 * Created by root on 25.02.15.
 */
//var aux1begin, aux1end, aux2begin, aux2end;
var t1, t2;
var prefix, sufx, newline;
var fs = require('fs');
var indexs = [];
var check;
var args = process.argv.slice(2);
//fs.unlinkSync('./output.txt');
fs.exists(args[1], function (exists) {
    fs.unlinkSync(args[1]); console.log('successfully deleted ' + args[1]);
});

//fs.readFileSync('./texto.txt').toString().split('\n').forEach(function (line) {
fs.readFileSync(args[0]).toString().split('\n').forEach(function (line) {
    //console.log(line);
    j=0;
    check = line.toString().indexOf(".put(");
    if (check != -1) {
        for (var i = 0; i < line.length; i++){
            if ((line.substring(i,i+1) == "\"") && (line.substring(i-1,i) != "\\")) {
                indexs[j]=i; j++;
            }
        }
        if (j==4){
            prefix=line.toString().substring(1,indexs[0]);
            sufx=line.toString().substring(indexs[3],line.length);
            t1=line.toString().substring(indexs[0],indexs[1]);
            t2=line.toString().substring(indexs[2],indexs[3]+1);
            newline = prefix + t2 + ", " + t1 + sufx;
            //fs.appendFileSync('./output.txt', newline.toString() + "\n");
            fs.appendFileSync(args[1], newline.toString() + "\n");
        }
        else
        {
            console.log(line.toString());
            console.error('erro! j = ' + j);
            process.exit(1);
        }
    }
    else
    {
        //fs.appendFileSync('./output.txt', line.toString() + "\n");
        fs.appendFileSync(args[1], line.toString() + "\n");
    }


    //if (line.substring(i+1,i+2) == "\\\"") {
     //   i+=3;indexs[j]=i; j++;
    //}


    //var position = line.toString().indexOf(".put(");

    /*if (position != -1) {
        prefix = line.toString().substr(1,position);
        aux1begin = position - 2;
        aux1end = line.toString().indexOf("\",") ;
        aux2begin = aux1end + 1;
        aux2end = line.toString().indexOf(");");
        newline = prefix + line.toString().substring(aux2begin,aux2end) + line.toString().substring(aux1begin, aux1end);
        fs.appendFileSync("./output.txt", newline.toString() + "\n");
    }
    */


});

process.exit(0);
