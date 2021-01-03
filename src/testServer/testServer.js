'use strict';

const https = require('https');
const fs = require('fs');
const { URL } = require('url');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

const routing = require('./routing.js');

const normalizePath = pathname => (
  pathname.endsWith('/') ? pathname : pathname + '/'
);

const authorizeUser = (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.setHeader(
      'WWW_Authenticate', 
      [ 'type=Basic', 'realm="Lemon"', 'charset="UTF-8"' ]
    );
    res.writeHead(401);
    res.end('<h1>&#127819You should authorize to access the site</h1>');
    return null;
  }
  const credentialsBase64 = authorization.split(' ')[1];
  const credentialsASCII = Buffer.from(credentialsBase64, 'base64').toString('ascii');
  return credentialsASCII.split(':');
};

const server = https.createServer(options, (req, res) => {
  const credentials = authorizeUser(req, res);
  if (!credentials) return;
  const { pathname } = new URL(req.url, 'https://localhost:8000/');
  const handler = routing[normalizePath(pathname)];
  if (!handler) {
    res.writeHead(404);
    return res.end('<h1>&#127819Page not found :(</h1>');
  }
  const data = handler(credentials, res);
  if (!data) return;
  res.writeHead(200);
  res.end((typeof data === 'string') ? data : JSON.stringify(data));
});

server.listen(8000);
console.log('Test server goes brrrrrrrrrrrr');
