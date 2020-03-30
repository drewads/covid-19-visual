const express = require('express');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const visualize = require(path.join(__dirname, 'visualize.js'));

const milliSecPerSec = 1000;
const secPerHour = 3600;
const hourInterval = 1;     // check for a new commit every hour

setInterval(visualize.revisualizeData, milliSecPerSec*secPerHour*hourInterval);

const server = express();
const PORT = 443;
const HTTP_PORT = 80;
/*const sslOptions = { // enable for deploy
	key: fs.readFileSync(path.join(__dirname, 'drewwadsworth.com.key')),
	cert: fs.readFileSync(path.join(__dirname, 'drewwadsworth.com.pem'))
};

https.createServer(sslOptions, server).listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
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

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

server.use(express.static(path.join(__dirname, '../data/plots')));

server.use((req, res) => {
    if (req.method === 'GET' || req.method === 'HEAD') {
        res.status(404);
        res.send('Error 404: File Not Found');
    } else {
        res.status(405);
        res.header('Allow', 'GET, HEAD');
        res.send('Error 405: Method Not Allowed');
    }
});