// exact name of default directory with all requests to hosts not in 'hosts' folder goes. Eg 127.0.0.*
const defaultAll = "everything_else";

const port = 80;								// Port to serve insecure requests.
const portS = 443;							// Port to serve secure requests. Put 0 if you dont' want to use.
const redirectInsecure = true;	// If 1 and portS != 0, then all insecure requests are redirected to secure. BE CAREFUL!

const logFileName = "logs/requestsLog.txt";

// If you are using secure, currently only supports wildcard domains
const sslKeyPath = "./ssl/star_eparas_com.key";
const sslCertPath = "./ssl/star_eparas_com.crt";
const caPaths = ["./ssl/intermediate_domain_ca.crt"];
const sslIgnoreHosts = ["localhost","127.0.0.1"];

/////////////////////////////////////////////////////////////
// Try not not change anything down here without knowledge //
/////////////////////////////////////////////////////////////

// get all the host names inside hosts directory
const fs = require('fs');
const myHostsList = [];					// will be filled automatically later, ignore
fs.readdirSync('./hosts/').forEach(file => {
  if (file.charAt(0) == "_" || file == defaultAll) return;
	myHostsList.push(file);
});

var ejs = require('ejs');

var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

var session = require('express-session')
var sessionOptions = { 
	secret: 'JS2K249JSIS9S8GJ843M', 
	cookie: { secure: true, maxAge: 3600000 },
	saveUninitialized: false,
	resave: false
	//store: new FileStore()
};
 
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

// Lets use the app 

// Setting up view engine
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
// app.set('views', 'cloud/views');

// Using bodyparser, session, and cookies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session(sessionOptions));
app.use(cookieParser("JS2K249JSIS9S8GJ843M"));

// INSECURE TO SECURE REDIRECT
if (portS != 0 && redirectInsecure == true)
	app.use('*', function(req, res, next) {
		if (req.secure)
			return next();
		
		for (var i = 0 ; i < sslIgnoreHosts.length; i++){
			if (req.headers.host == sslIgnoreHosts[i]) // || (req.headers.host && req.headers.host.search && req.headers.host.search("127.0.0.") == 0))
				return next();
		}
		console.log("Insecure request at " + req.headers.host + req.url + " redirected to secure.");
		res.redirect('https://' + req.headers.host + req.url);
	})

// Logging into console, log.txt, and saving the log and defaultAll in req.log and req.defaultAll for later use
app.use('*', (req, res, next) => {
	var currentdate = new Date();
	var ip = req.connection.remoteAddress || req.header('x-forwarded-for');
	if (!fs.existsSync(logFileName.split('/')[0]))
		fs.mkdirSync(logFileName.split('/')[0]);
	var log = (`${req.method} on ${req.protocol}://${req.hostname}${req.originalUrl} by ${ip} at time ` 
                + (currentdate.getMonth()+1) + "/" + currentdate.getDate() + "/" + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds());
	req.log = log;
	req.defaultAll = defaultAll;
	console.log(log);
	fs.appendFile(logFileName, log + '\r\n', function (err) { if (err) console.log("Couldn't log.", err);})
	next();
});

// loading global static files
app.use('/g_stat', express.static('./public/'));

// loading host routers
myHostsList.push(defaultAll);
var myHosts = {};
for (var n = 0; n < myHostsList.length; n++){
	myHosts[myHostsList[n]] = require(`./hosts/${myHostsList[n]}/main`);
	app.use(myHosts[myHostsList[n]].router);
}

// if nothing above can handle the requests
app.all("*", function(req,res) {
	res.status(404).send('Content not found!');
});






// Finally, go live
httpServer.listen(port, () => { console.log("Listening on port: " + port);});
if (portS != 0)
	httpsServer.listen(portS, () => {console.log("Listening on port: " + portS);});
