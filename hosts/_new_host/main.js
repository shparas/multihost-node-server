// I didn't put these code with the app.js so that I can customize it well for each host
const logLocal = true;
const showServedPath = 1; // Not implemented currently, logs what was served for current request
const homePages = ["index.html", "home.html"]; // What to consider homepage inside pages dir
const defaultNotFound = "unexpected.html";
const logFileDir = "logs";
const logFileName = logFileDir + "/requestsLog.txt";

/////////////////////////////////////////////////////////////
// Try not not change anything down here without knowledge //
/////////////////////////////////////////////////////////////

var fs = require('fs');

var express = require('express');
var app = express.Router();

var path = require('path');
var hostname = path.basename(__dirname);
var cwd = `./hosts/${hostname}`;

// gateway function for host filtering
app.use(function(req, res, next) {
  if (hostname != req.defaultAll && hostname != req.hostname)
    next('router');
  else
    next();
});

// logging into the local log file, only if logLocal is True
if (logLocal == true) {
  if (!fs.existsSync(`${cwd}/${logFileDir}`))
    fs.mkdirSync(`${cwd}/${logFileDir}`);
  app.use((req, res, next) => {
    var logFile = `${cwd}/${logFileName}`;
    fs.appendFile(logFile, req.log + '\r\n', function(err) {
      if (err) console.log("Couldn't log: ", err);
    });
    next();
  });
}

// serving static files from public directory (syles, scripts, images, and file)
app.use(express.static(`${cwd}/public`)); // to separate: app.use('/styles', express.static(`${cwd}/public/styles`));

// for page at '/' is served by first available file from homePages dir
var homePage = ""; // default
for (var i = 0; i < homePages.length; i++) {
  if (fs.existsSync(`${cwd}/public/${homePages[i]}`)) { // homepage available
    var homePage = `${cwd}/public/${homePages[i]}`;
    app.use('/$/', function(req, res) {
      res.status(200).sendFile(homePage, {
        root: "./"
      });
    });
    break;
  }
}

// **************************************** //
// Your middlewares or anything can go here
// ---------------------------------------- //
if (fs.existsSync(`${cwd}/routes/router.js`)) {
  app.use(require(`./routes/router`));
}
// ---------------------------------------- //
// **************************************** //

// for lost page or anything anything else not handled above
if (fs.existsSync(`${cwd}/public/${defaultNotFound}`)) {
  app.all("*", function(req, res) {
    res.status(404).sendFile(`${cwd}/public/${defaultNotFound}`, {
      root: "./"
    });
  });
} else {
  app.all("*", function(req, res, next) {
    res.status(404).send('Content not found!');
  });
}

// Export
module.exports = {
  router: app
}