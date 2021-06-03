'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const createServer = require('./testServer.js');

http.name = 'http';
https.name = 'https';

const key = (() => {
  try {
    return fs.readFileSync('key.pem');
  } catch (e) {
    return undefined;
  }
})();

const cert = (() => {
  try {
    return fs.readFileSync('cert.pem');
  } catch (e) {
    return undefined;
  }
})();

const options = { key, cert };

const protocol = key && cert ? https : http;

const server = createServer(protocol, options);

server.listen(process.env.PORT || 8000);
console.log('Test server goes brrrrrrrrrrrr');
const address = { ...server.address(), protocol: protocol.name };
console.dir(address);
