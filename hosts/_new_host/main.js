const logLocal = true ;
const showServedPath = 1;	// Not implemented currently, logs what was served for current request
const usePagesDir = true;	// if you don't wanna use pages for html pages, put all web contents inside pages
const homePages = ["index.html", "home.html"];	// What to consider homepage inside pages
const defaultNotFound = "unexpected.html";
const logFileName = "requestsLog.txt";

/////////////////////////////////////////////////////////////
// Try not not change anything down here without knowledge //
/////////////////////////////////////////////////////////////

var path = require('path');
var hostname = path.basename(__dirname);

var express = require('express');
var router = express.Router();

var fs = require('fs');

// gateway function for hosts
router.use(function(req, res, next) {
	// gateway for hosts
	if (hostname != req.everythingElse){
		if (req.hostname != hostname){
			next('router');
		} else {
			next();
		}
	}
	// gateway for "everything_else"
	else {
		next();
	}
});

// logging into the local log file, only if logLocal is True
if (logLocal == true) {
	router.use((req, res, next) => {
		var logFile = `./hosts/${hostname}/` + logFileName;
		fs.appendFile(logFile, req.log + '\r\n', function (err) { if (err) console.log("Couldn't log.", err);});
		next();
	});
}

// serving static files from public directory (syles, scripts, images, and file)
router.use('/styles', express.static(`./hosts/${hostname}/public/styles`));
router.use('/scripts', express.static(`./hosts/${hostname}/public/scripts`));
router.use('/images', express.static(`./hosts/${hostname}/public/images`));
router.use('/files', express.static(`./hosts/${hostname}/public/files`));

// for page at '/' only
var homePage = "";	// default
for (var i = 0; i < homePages.length; i++){
	try {
		if (fs.existsSync(`./hosts/${hostname}/public/pages/` + homePages[i])) {
			homePage = `./hosts/${hostname}/public/pages/` + homePages[i];
			break; 		//file exists so break the loop
		}
	} catch(err) { /* Oops */ }
}
if (homePage != ""){
	router.use('/$/', function(req, res){
		// if (homePage != "") router.use('/', express.static(homePage));
		res.status(200).sendFile(homePage, {root: "./"});
	});
}

// for html pages inside pages directory
router.use(express.static(`./hosts/${hostname}/public/pages`));
	


// your handler can go here


	
// for lost page or anything anything else not handled above
if (fs.existsSync(`./hosts/${hostname}/public/pages/${defaultNotFound}`)){
	router.all("*", function(req,res) {
		res.status(404).sendFile(`./hosts/${hostname}/public/pages/${defaultNotFound}`, {root: "./"});
	});
} else {
	router.all("*", function(req,res) {
		res.status(404).send('Content not found!');
	});
}

socket = require(`./socket.js`);	// since this is used right here and all others before is used in the app.js
module.exports = {router: router, socket: socket}

// END



/*
// other functions currently not in use
router.get('/', function(req,res) { console.log("localhost access"); });
router.get('/about', function(req, res) { console.log("localhost/about Access");});
// FileExist Test: try {	if (fs.existsSync(filePath)) {		//file exists	}} catch(err) {	console.error(err)}
*/
