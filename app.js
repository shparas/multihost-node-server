// Exact name of directories inside hosts/ that should be same as hostname of request.
// Don't include everything_else
const myHostsList = ["localhost", "wishes.eparas.com"]
const everythingElse = "everything_else";	// One where all requests to host not in myHostsList goes to.		

const port = 80;		// Port to serve insecure requests.
const portS = 443;		// Port to serve secure requests. Put 0 if you dont' want to use.
const redirectInsecure = 1;	// If 1 and portS != 0, then all insecure requests are redirected to secure.

const logFileName = "requestsLog.txt";

// If you are using secure
const sslKeyPath = "./ssl/star_eparas_com.key";
const sslCertPath = "./ssl/star_eparas_com.crt";
const caPaths = ["./ssl/intermediate_domain_ca.crt"]

/////////////////////////////////////////////////////////////
// Try not not change anything down here without knowledge //
/////////////////////////////////////////////////////////////
var fs = require('fs');

var express = require('express');
var app = express();

var httpServer = require('http').Server(app);

// HTTPS Option
var httpsOptions = {}
var httpsServer = {}
if (portS != 0){
	httpsOptions = {
		key: fs.readFileSync(sslKeyPath),
		cert: fs.readFileSync(sslCertPath),
		ca: []
	};
	for (var i = 0; i < caPaths.length; i++)
		httpsOptions.ca.push(fs.readFileSync(caPaths[i]));
	httpsServer = require('https').Server(httpsOptions, app);
}

// Socket.io
var io = new require('socket.io')()
io.attach(httpServer);
io.attach(httpsServer);


// Lets use the app
/* INSECURE TO SECURE REDIRECT, doesn't apply for localhost and 127.0.0.X */
if (portS != 0)
	app.use('*', function(req, res, next) {
		if (req.secure || req.headers.host == "localhost" || req.headers.host.search("127.0.0.") == 0) {
			next();
		}
		else {
			console.log("Insecure request at " + req.headers.host + req.url + " redirected!");
			res.redirect('https://' + req.headers.host + req.url);
		}
	})

// Logging into console, log.txt, and saving the log and everythingElse in req.log and req.everythingElse for later use
app.use('*', (req, res, next) => {
	var currentdate = new Date();
	var ip = req.connection.remoteAddress || req.header('x-forwarded-for');
	var logFile = `logs/${logFileName}`;
	var log = (`${req.method} on ${req.protocol}://${req.hostname}${req.originalUrl} by ${ip} at time ` 
                + (currentdate.getMonth()+1)  + "/" 
				+ currentdate.getDate() + "/"
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds());
	req.log = log;
	req.everythingElse = everythingElse
	console.log(log);
	fs.appendFile(logFile, log + '\r\n', function (err) { if (err) console.log("Couldn't log.", err);})
	next();
});

// loading global static files
app.use('/g_styles', express.static('./public/styles'));
app.use('/g_scripts', express.static('./public/scripts'));
app.use('/g_images', express.static('./public/images'));
app.use('/g_files', express.static('./public/files'));

// loading host routers
myHostsList.push(everythingElse)
var myHosts = {}
var mySockets = {}
for (var n = 0; n < myHostsList.length; n++){
	myHosts[myHostsList[n]] = require(`./hosts/${myHostsList[n]}/main`);
	mySockets[myHostsList[n]] = myHosts[myHostsList[n]].socket(io);
	app.use(myHosts[myHostsList[n]].router);
}

// Finally, go live
httpServer.listen(port, () => { console.log("Listening on port: " + port);});
if (portS != 0)
	httpsServer.listen(portS, () => {console.log("Listening on port: " + portS);});



/* IMP NOTES
1. when you require something, THING as in module.exports = THING is returned.
2. "loading host routers" other method:
	var localhost = require('./hosts/localhost/main');
	app.use(localhost.router);
	localhost_sock = localhost.socket(io);

	var host_else = require('./hosts/host_else/main');
	app.use(host_else.router);
	host_else_sock = host_else.socket(io);
*/