'use strict';

const routing = require('./routing.js');

const normalizePath = pathname => (
  pathname.endsWith('/') ? pathname : pathname + '/'
);

const makeData = string => (
  JSON.stringify({ error: `&#127819${string}` })
);

const authorizeUser = (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.setHeader(
      'WWW-Authenticate',
      [ 'Basic', 'realm="Lemon"', 'charset="UTF-8"' ]
    );
    res.writeHead(401);
    res.end(makeData('You should authorize to access the site'));
    return null;
  }
  const credentialsBase64 = authorization.split(' ')[1];
  const credentialsASCII = Buffer.from(credentialsBase64, 'base64')
    .toString('ascii');
  return credentialsASCII.split(':');
};

const createServer = (protocol, options) => (
  protocol.createServer(options, (req, res) => {
    const credentials = authorizeUser(req, res);
    if (!credentials) return;
    const handler = routing[req.method][normalizePath(req.url)];
    if (!handler) {
      res.writeHead(404);
      return res.end(makeData('Page not found :('));
    }
    const user = {
      login: credentials[0],
      password: credentials[1],
    };
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
          body += chunk.toString();
      });
      req.on('end', () => {
        const { code, data } = handler(user, body);
        res.writeHead(code);
        res.end(JSON.stringify(data));
      })
    } else {
      const { code, data } = handler(user);
      res.writeHead(code);
      res.end(JSON.stringify(data));
    }
  })
);

module.exports = createServer;
