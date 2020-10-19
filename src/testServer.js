'use strict';

const https = require('https');
const fs = require('fs');
const url = require('url');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

const routing = require('./routing.js');

const normalizePath = pathname => (
  pathname.endsWith('/') ? pathname : pathname + '/'
);

const server = https.createServer(options, (req, res) => {
  const { pathname } = url.parse(req.url, true);
  const handler = routing[normalizePath(pathname)];
  if (!handler) {
    res.writeHead(404);
    return res.end('<h1>&#127819Page not found :(</h1>');
  }
  const data = handler(req, res);
  if (!data) return;
  res.writeHead(200);
  res.end((typeof data === 'string') ? data : JSON.stringify(data));
});

server.listen(8000);
console.log('Test server goes brrrrrrrrrrrr');
