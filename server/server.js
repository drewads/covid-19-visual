const express = require('express');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const visualize = require(path.join(__dirname, 'visualize.js'));

const milliSecPerSec = 1000;
const secPerHour = 3600;
const hourInterval = 1;     // check for a new commit every hour

visualize.revisualizeData();
setInterval(visualize.revisualizeData, milliSecPerSec*secPerHour*hourInterval);

const server = express();
const PORT = 443;
const HTTP_PORT = 80;
const sslOptions = {
	key: fs.readFileSync(path.join(__dirname, 'drewwadsworth.com.key')),
	cert: fs.readFileSync(path.join(__dirname, 'drewwadsworth.com.pem'))
};

https.createServer(sslOptions, server).listen(PORT, () => {
    console.log(`https server listening on port ${PORT}`);
});

http.createServer(server).listen(HTTP_PORT, () => {
    console.log(`http server listening on port ${HTTP_PORT}`);
});

server.all('*', (req, res, next) => {
    if (req.secure) {
	    next();
    } else {
        res.redirect(308, `https://${req.hostname}${req.url}`);
    }
});

const setNoStore = (res, path, stat) => {
    res.set('Cache-Control', 'no-store');
} 

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