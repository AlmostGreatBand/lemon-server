'use strict';

// TODO: Add implementation of test server with Lemon API listening on localhost
// Test server can be run by 'npm run testServer' command (see package.json).
console.log('Test server goes brrrrrrrrrrrr');
'use strict';

// TODO: Add implementation of test server with Lemon API listening on localhost
// Test server can be run by 'npm run testServer' command (see package.json).

const https = require('https');
const fs = require('fs');
const url = require('url');

const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
};

const normalizePath = pathname => (
  pathname.endsWith('/') ? pathname : pathname + '/'
);

const routing = {
  '/': () => '<h1>Welcome to Lemon&#127819 Server!</h1>',
  '/favicon.ico/': () => {}, //Debug, never mind
  '/profile/': () => '<h1>&#127819Your profile will be here</h1>',
  '/cards/': () => '<h1>&#127819Your cards will be here</h1>',
  '/transactions/': () => '<h1>&#127819Your transactions will be here</h1>',
  '/registration': () => '<h1>&#127819Registration process will be here</h1>',
};

const server = https.createServer(options, (req, res) => {
  const { pathname } = url.parse(req.url);
  const handler = routing[normalizePath(pathname)];
  if (!handler) {
    res.writeHead(404);
    return res.end('<h1>&#127819Page not found :(</h1>');
  };
  const data = handler();
  res.writeHead(200);
  res.end((typeof data === 'string') ? data : JSON.stringify(data));
});

server.listen(8000);
console.log('Test server goes brrrrrrrrrrrr');
