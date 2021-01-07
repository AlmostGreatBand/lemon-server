'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const routing = require('./routing.js');

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


const normalizePath = pathname => (
  pathname.endsWith('/') ? pathname : pathname + '/'
);

const authorizeUser = (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.setHeader(
      'WWW-Authenticate',
      [ 'Basic', 'realm="Lemon"', 'charset="UTF-8"' ]
    );
    res.writeHead(401);
    res.end('<h1>&#127819You should authorize to access the site</h1>');
    return null;
  }
  const credentialsBase64 = authorization.split(' ')[1];
  const credentialsASCII = Buffer.from(credentialsBase64, 'base64')
    .toString('ascii');
  return credentialsASCII.split(':');
};

const protocol = key && cert ? https : http;

const server = protocol.createServer(options, (req, res) => {
  const credentials = authorizeUser(req, res);
  if (!credentials) return;
  const handler = routing[normalizePath(req.url)];
  if (!handler) {
    res.writeHead(404);
    return res.end('<h1>&#127819Page not found :(</h1>');
  }
  const data = handler(credentials, res);
  if (!data) return;
  res.writeHead(200);
  res.end((typeof data === 'string') ? data : JSON.stringify(data));
});

server.listen(process.env.PORT || 8000);
console.log('Test server goes brrrrrrrrrrrr');
const address = { ...server.address(), protocol: protocol.name };
console.dir(address);
