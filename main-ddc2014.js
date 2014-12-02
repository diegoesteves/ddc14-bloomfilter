/**@license
 * program: compute links between 2 datasets using bloomfilter
 * author: diego esteves (dnes85)
 * version: 0.2.0 (30-Nov-2014)
 
 * 
 * links between resources
 * 1) try to store the objects+hash+dataset in mongoDB
 */

//PAREI: VER COMO PASSAR OS PARAMETROS SEM SER GLOBAL! FALTA SO ISSO PRA BLOOMFILTER AJUSTE
//DEPOIS TESTAR IMPLEMENTACAO EM NODE
//ver aquirov smartmain E site http://www.sebastianseilund.com/nodejs-async-in-practice


//dbpedia = 1.521.738 (nao deveria ser 1.521.648? )
//news = 1.769

/*
dbpedia 
parsed 6.173.488 triplas
rapper -g dewiki-20140114-article-categories.ttl | cut -f1 -d '>' | sort -u | sed 's/<//' > subjects.dbpedia
1.521.738 returned (considering resources)

news
12.289 triples
rapper -g News-100.ttl | grep -v '"'  | cut -f3 -d '>' | sed 's/ <//' | sort -u > news.objects
575 returned (considering resources)

checking
263 links
comm -1 -2  news.objects subjects.dbpedia  | wc -l 
*/

var async = require('async');
var smartrun = require('./smartstream2');
var bf = require('./bloomfilter');
var timezero = process.hrtime();
var sufix = '.ntriples';
var timeprocess;
var diff;
var exec = require('child_process').exec;
var execSync = require('execSync');

var execparser = false; //aux to debug mode...

var arrdist = []; //array of objects to compare to bloomfilter
var totdist = 0; //number of distinct triples 

var file1 = '';
var file2 = '';
var f1, f2, s1, s2 ,x1 = '', x2 = '';
var ff = ''; //biggest file
var ss = ''; //size of the biggest file
var fs = ''; //smallest file
var totfile1 =-1; //n
var totfile2 = -1; //n
var totfile2_dist = -1;
var totbloompos = 0;

var timezerofunctions;
var difffunctions;

/*
 * AUXILIAR
 */
Array.prototype.unique = function() {
	var o = {}, i, l = this.length, r = [];
	for(i=0; i<l;i+=1) o[this[i]] = this[i];
	for(i in o) r.push(o[i]);
	return r;
};

/* distinct operation */
function getUnique(file, callback){
	console.log();
	console.log("getUnique(" + file + ")");
	timefunctions = process.hrtime();
	var objlist = [];
	var objListDistinct;
	var fs = require('fs');
	var text = '';
	var tot = 0;

	if (fs.existsSync(file)) {
		text = fs.readFileSync(file, "utf8");
		text.split('\n').forEach(function (line) {
			if(line){tot +=1; objlist.push(line);}
		});
		objListDistinct = objlist.unique();
		
		difffunctions = process.hrtime(timefunctions); 
		console.log("  [%ds %dms]", difffunctions[0], difffunctions[1]/1000000); //shouldnt be here, but the time difference is not relevant in this case.
		
		if (tot > 0){
			if (tot==objListDistinct.length) {
				callback(tot, objListDistinct, '  :done! the file [' + file + '] has ' + tot + ' distinct triples! nothing else to do here...');
			}else{
				callback(tot, objListDistinct, '  :done! the file [' + file + '] had ' + tot + ' triples and now has ' + objListDistinct.length + ' triples');
			}
		} else {
			callback(tot, objListDistinct, '  :error-> the file ' + file + ' is empty!');
		}
	}
	else{callback(0, null, '  :error-> file ' + file + ' not found!');}  
}

/* transform the file to ntriples format and save the subjects (0) or objects (1)  */
function transform(file, target, callback){
	console.log();
	console.log("call transform(" + file + ")");
	var msg ='';
	var _s;
	var _triples=0;
	var cmd = '';
	timefunctions = process.hrtime();
	
	if (!execparser){
		callback(-1, 'function not activated.');}
	else{
		if (target==0){
			cmd = "rapper -g -o ntriples " + file + " | cut -f1 -d '>' | sort -u | sed 's/<//' > " + file + sufix;}
		else{
			cmd = "rapper -g -o ntriples " + file + " | grep -v '\"' | cut -f3 -d '>' | sed 's/ <//' | sort -u > " + file + sufix;}

		
		console.log('cmd = ' + cmd);
		_s = execSync.exec(cmd);	
		
		/* this is not the correct value (triples parsed and not triples returned), but should gives an idea for find out the biggest and smallest one...*/
		_triples = _s.stdout.substring(_s.stdout.indexOf("returned") + 9,_s.stdout.indexOf(" triples"));
		msg = "  :ok file [" + file + sufix + "] has been created based on " + _triples + ' triples parsed!';
		difffunctions = process.hrtime(timefunctions); 
		console.log("  [%ds %dms]", difffunctions[0], difffunctions[1]/1000000); //
		callback(_triples, msg);
	}
}


/* check whether the files are compressed  */
function checkCompressed(val, callback){
	var exec = require('child_process').exec;
	console.log();
	console.log("call checkCompressed(" + val + ")");
	timefunctions = process.hrtime();
	
	if (val.indexOf(".zip") > -1) {
		_temp = val.substring(0, val.indexOf(".zip"));
		exec('gunzip -c ' + val + ' > ' + _temp, function(err, stdout, stderr) {
			difffunctions = process.hrtime(timefunctions); 
			console.log("  [%ds %dms]", difffunctions[0], difffunctions[1]/1000000); //
			callback(true, _temp, '  :ok!' + val + ' has been extracted!');
		});
	}
	else if (val.indexOf(".tar") > -1) {
		_temp = val.indexOf(".tar");
		exec('tar -xf ' + val, function(err, stdout, stderr) {
			difffunctions = process.hrtime(timefunctions); 
			console.log("  [%ds %dms]", difffunctions[0], difffunctions[1]/1000000); //
			callback(true, _temp, '  :ok!' + val + ' has been extracted!');
		});
	}
	else if (val.indexOf(".gz") > -1) {
		_temp = val.substring(0, val.indexOf(".gz"));
		exec('gzip -d -f ' + val + ' > ' + _temp, function(err, stdout, stderr) {
			difffunctions = process.hrtime(timefunctions); 
			console.log("  [%ds %dms]", difffunctions[0], difffunctions[1]/1000000); //
			callback(true, _temp, '  :ok!' + val + ' has been extracted!');
		});
	}
	else{
		difffunctions = process.hrtime(timefunctions); 
		console.log("  [%ds %dms]", difffunctions[0], difffunctions[1]/1000000); //
		callback(false, null, '  :that\'s ok![' + val + '] isn\'t a compressed file!');
	}
}

/* check whether the number of parameters are ok */
function emptyParameters(callback){
	console.log();
	console.log("call emptyParameters()");
	timefunctions = process.hrtime();
	var fs = require('fs');
	var arguments = process.argv.slice(2);
	if (arguments.length != 2) {callback(true, "  :ops, we need 2 files...");}
	else {
		file1=arguments[0]; 
		file2=arguments[1];
		if (!(fs.existsSync(file1))) {
			callback(true, "  :error-> [" + file1 + "] doesnt exists!")}
		else if (!(fs.existsSync(file2))) {
			callback(true, "  :error-> [" + file2 + "] doesnt exists!")}
		else {callback(false, "  :got it-> [" + file1 + "] and [" + file2 + "]!");}	
	}
	difffunctions = process.hrtime(timefunctions); 
	console.log("  [%ds %dms]", difffunctions[0], difffunctions[1]/1000000); //
}

function checkFileProperties(callback){
	console.log();
	console.log("call checkFileProperties()");
	timefunctions = process.hrtime();
	
	var _fs = require("fs");
	var stats1;
	var stats2;
	var statsbig;
	var msg='';
	
	exec(stats1 = _fs.statSync(file1), function(err, stdout, stderr) {
		exec(stats2 = _fs.statSync(file2), function(err, stdout, stderr) {
			if (stats1["size"] > stats2["size"]) {
				ss=s2;ff=file1;fs=file2;statsbig=stats1["size"];
			}else {
				ss=s1;ff=file2;fs=file1;statsbig=stats2["size"];
			}
			msg = '  :got it! the biggest file shoud be [' + ff + '] based on its size ~' + statsbig / 1000000.0 + ' MB';
			
			difffunctions = process.hrtime(timefunctions);
			console.log("  [%ds %dms]", difffunctions[0], difffunctions[1]/1000000); //
			callback(msg);
		});
	});
}

console.log("******************************************************************");
console.log("Starting the Process");
console.log("******************************************************************");
async.series([
              function(callback) {
            	  emptyParameters(function(err, msg) {
            		  if (err===true){console.log(msg);} 
            		  else {console.log(msg); callback();} 
                  });
              },  
              function(callback) {
            	  checkCompressed(file1, function(done, out, msg) {
            		  if (done===true) {x1=out;} 
            		  console.log(msg); callback();
            	  });
              },
              function(callback) {
            	  checkCompressed(file2, function(done, out, msg) {
            		  if (done===true) {x2=out;}
            		  console.log(msg); callback();
            	  });
              },
              function(callback) {
            	  console.log();
            	  console.log('Checking names and updating variables...');
            	  timefunctions = process.hrtime();
            	  (x2 === ''?'':file2=x2);
            	  (x1 === ''?'':file1=x1);
            	  console.log('  :file 01: ' + file1);
            	  console.log('  :file 02: ' + file2);
            	  difffunctions = process.hrtime(timefunctions); 
      			  console.log("  [%ds %dms]", difffunctions[0], difffunctions[1]/1000000); //
            	  callback();
              },
              function(callback) {
            	  transform(file1, 0, function(out, msg) {
            		  s1=out; console.log(msg); callback();
            	  });
              },
              function(callback) {
            	  transform(file2, 1, function(out, msg) {
            		  s2=out; console.log(msg); callback();
            	  });
              },
              function(callback) {
            	  checkFileProperties(function(msg) {
            		  console.log(msg); callback();
            	  });
              },
              function(callback) {
            	  getUnique(fs + sufix, function(tot, arr, msg) {
            		  console.log(msg);
            		  totdist=tot;
            		  arrdist=arr;
            		  if (tot>0) callback();   		  
            	  });
              },
              function(callback) {
            	  console.log();
            	  console.log("Starting bloomfilter"); 
            	  bf.run(ff+sufix, 1521738, arrdist, function(err) {
            		  callback();
            	  });
              },
              ],
              function(err, results) {  
				var str = '';
				results.forEach(function(result) {
					if (result) {str += result + ' - ';}
				});
				console.log(str);
				diff = process.hrtime(timezero); 
				console.log("******************************************************************");
				console.log("Total Execution Time       : %ds %dms", diff[0], diff[1]/1000000); //
				console.log("******************************************************************");
				process.exit(0);
			}
);