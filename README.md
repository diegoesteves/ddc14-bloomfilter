ddc14-bloomfilter
=================

node js implementation of bloomfilter for compute number of links between 2 files
this is the first release and should be adjusted...
 
 
bloomfilter's performance overview
=================
:Defining bloomfilter parameters...  [0s 3.81267ms]

:Indexing file dewiki-20140114-article-categories.ttl.ntriples...[3s 88.882374ms]

:Lookup...total size of array is 575  [0s 27.010578ms]

next steps / tests
=================
a) try rdf library

b) save objects on mongodb (subject/object + hash + distrib)

c) create a webservice

full log
=================
esteves@estevesaksw:~/workspace/dynamicdatacloud$ node main-ddc2014.js dewiki-20140114-article-categories.ttl News-100.ttl.zip
******************************************************************
Starting the Process
******************************************************************

call emptyParameters()
  :got it-> [dewiki-20140114-article-categories.ttl] and [News-100.ttl.zip]!

call checkCompressed(dewiki-20140114-article-categories.ttl)
  [0s 0.010994ms]
  :that's ok![dewiki-20140114-article-categories.ttl] isn't a compressed file!

call checkCompressed(News-100.ttl.zip)
  [0s 4.039923ms]
  [0s 19.305424ms]
  :ok!News-100.ttl.zip has been extracted!

Checking names and updating variables...
  :file 01: dewiki-20140114-article-categories.ttl
  :file 02: News-100.ttl
  [0s 0.097888ms]

call transform(dewiki-20140114-article-categories.ttl)
cmd = rapper -g -o ntriples dewiki-20140114-article-categories.ttl | cut -f1 -d '>' | sort -u | sed 's/<//' > dewiki-20140114-article-categories.ttl.ntriples
  [167s 599.046465ms]
  :ok file [dewiki-20140114-article-categories.ttl.ntriples] has been created based on 6173488 triples parsed!

call transform(News-100.ttl)
cmd = rapper -g -o ntriples News-100.ttl | grep -v '"' | cut -f3 -d '>' | sed 's/ <//' | sort -u > News-100.ttl.ntriples
  [0s 181.24381ms]
  :ok file [News-100.ttl.ntriples] has been created based on 12289 triples parsed!

call checkFileProperties()
  [0s 5.390726ms]
  :got it! the biggest file shoud be [dewiki-20140114-article-categories.ttl] based on its size ~942.281115 MB

getUnique(News-100.ttl.ntriples)
  [0s 1.538619ms]
  :done! the file [News-100.ttl.ntriples] has 575 distinct triples! nothing else to do here...

Starting bloomfilter

  :Defining bloomfilter parameters...
  -> max expected fp rate		                 : 0.012%
  -> total of bits to allocate               : 28594429
  -> total of hash functions                 : 13
  -> ~number of itens to store in BlommFilter: 1521738
  [0s 3.81267ms]

  :Indexing file dewiki-20140114-article-categories.ttl.ntriples...
  ->saving file _out.bloom on disk. total triples = 1521738
  [3s 88.882374ms]

  :Lookup...total size of array is 575
  [0s 27.010578ms]
  -> ~number of links -> 264
---------------------------
  :bloomfilter total time-> [3s 120.218496ms]


******************************************************************
Total Execution Time       : 170s 936.647522ms
******************************************************************

