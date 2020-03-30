const express = require('express');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const visualize = require(path.join(__dirname, 'visualize.js'));

const milliSecPerSec = 1000;
const secPerHour = 3600;
const hourInterval = 1;     // check for a new commit every hour

visualize.revisualizeData(); // disable for deploy
// setInterval(visualize.revisualizeData, milliSecPerSec*secPerHour*hourInterval); // enable for deploy

const server = express();
const PORT = 443;
const HTTP_PORT = 8080; // change for deploy
/*const sslOptions = { // enable for deploy
	key: fs.readFileSync(path.join(__dirname, 'drewwadsworth.com.key')),
	cert: fs.readFileSync(path.join(__dirname, 'drewwadsworth.com.pem'))
};

https.createServer(sslOptions, server).listen(PORT, () => {
    console.log(`https server listening on port ${PORT}`);
});*/

http.createServer(server).listen(HTTP_PORT, () => {
    console.log(`http server listening on port ${HTTP_PORT}`);
});

/*server.all('*', (req, res, next) => { // enable for deploy
    if (req.secure) {
	    next();
    } else {
        res.redirect(308, `https://${req.hostname}${req.url}`);
    }
});*/

const setNoStore = (res, path, stat) => {
    res.set('Cache-Control', 'no-store');
} 
// change the following. only index.html should have no-store header, but shud prob content hash the others
server.use(express.static(path.join(__dirname, '../dist'), {setHeaders: setNoStore}));

server.use(express.static(path.join(__dirname, '../data/plots')));

server.get('*', (req, res) => {
    res.status(404);
    res.send('Error 404: File Not Found');
});

server.all('*', (req, res) => {
    res.status(405);
    res.header('Allow', 'GET, HEAD');
    res.send('Error 405: Method Not Allowed');
});