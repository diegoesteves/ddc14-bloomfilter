var bf = require("./node_modules/bloomfilter/bloomfilter.js");
var exec = require('child_process').exec;
var fs;
var BloomFilter = bf.BloomFilter;
var bloom;
var line2aux2 = '';
var totbloomfilter =0; //total itens added on bloomfilter
var auxlinkedobjects=''; //list of linked files 

var n = 0; //number of itens - 1521738
var p = 0.00012; //max expected fp rate
var m = 0; //number of bits to allocate
var k = 0; //number of hash functions

var file_out_bloom = "_out.bloom"; //full bloomfilter array
var file_out_bloom_array = "_out_array.bloom" ; //full bloomfilter array of hash
var file_out_bloom_pos = "_out_pos.bloom"; //list of links between A and B
var timezero;
var timefunctions;
var difffunctions;
var totbloompos = 0;

function defineParameters(n, p){
	console.log();
	console.log('  :Defining bloomfilter parameters...');
	m = Math.ceil((n * Math.log(p))/Math.log(1.0/(Math.pow(2.0, Math.log(2.0)))));
	k = Math.round(Math.log(2.0) * m/n);
	console.log('  -> max expected fp rate		     : ' + p * 100 + '%');
	console.log('  -> total of bits to allocate               : ' + m);
	console.log('  -> total of hash functions                 : ' + k);
	console.log('  -> ~number of itens to store in BlommFilter: ' + n);
	
}

function createBloomfilter(_file){
	console.log();
	console.log('  :Indexing file ' + _file + '...');
	
	bloom = new BloomFilter(m,k);
	fs = require('fs');
	var text = fs.readFileSync(_file, "utf8");
	
	
	text.split('\n').forEach(function (line) { ///\r?\n/
		if (line){
			bloom.add(line);
			line2aux2 += line + '\n';
			totbloomfilter+=1;
		}
	});
	var array = [].slice.call(bloom.buckets);
	var _json = JSON.stringify(array);
	
	fs.writeFileSync(file_out_bloom_array, _json, 'utf8');
	console.log('  ->saving file ' + file_out_bloom + ' on disk. total triples = ' + totbloomfilter);
	fs.writeFileSync(file_out_bloom, line2aux2, 'utf8');
	
}

function lookUp(arr){
	console.log();
	console.log('  :Lookup...total size of array is ' + arr.length);
	
	arr.forEach(function (obj) {
		if (obj){
			if (bloom.test(obj) == true) {
				totbloompos+=1; 
				auxlinkedobjects += obj + '\n'
			}
		}
	});
	fs = require('fs');
	fs.writeFileSync(file_out_bloom_pos, auxlinkedobjects.substring(0,auxlinkedobjects.length -1), 'utf8');
	
	
}

function overview(){
	difffunctions = process.hrtime(timezero);
	console.log("---------------------------");
	console.log("  :bloomfilter total time-> [%ds %dms]", difffunctions[0], difffunctions[1]/1000000);
	console.log("");
}

exports.run = function(file, n, arrlookup, callback){
	timezero = process.hrtime();
	timefunctions = process.hrtime();
	exec(defineParameters(n, p), function(err, stdout, stderr) {
		difffunctions = process.hrtime(timefunctions);
		console.log("  [%ds %dms]", difffunctions[0], difffunctions[1]/1000000); //
		
		timefunctions = process.hrtime();
		exec(createBloomfilter(file), function(err, stdout, stderr) {
			difffunctions = process.hrtime(timefunctions); 
			console.log("  [%ds %dms]", difffunctions[0], difffunctions[1]/1000000); //
			
			timefunctions = process.hrtime();
			exec(lookUp(arrlookup), function(err, stdout, stderr) {
				difffunctions = process.hrtime(timefunctions); 
				console.log("  [%ds %dms]", difffunctions[0], difffunctions[1]/1000000); //
				console.log("  -> ~number of links -> " + totbloompos);
				overview();
				callback();
			});		
		});
	});	
}





