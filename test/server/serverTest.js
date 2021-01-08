'use strict';

const assert = require('assert').strict;
const http = require('http');
const fs = require('fs');
const createServer = require('../../src/testServer/testServer.js');

const url = 'http://localhost:8000/';
const paths = [ 'profile/', 'cards/', 'transactions/', 'profile' ];

const testCase = (credentials, code, expected) => (
  { credentials, code, expected }
);
const tests = [
  testCase('alegator:good_job', 200, ''),
  testCase('Anauthorized', 401, 'You should authorize to access the site'),
  testCase(':', 401, 'Login and password should be specified'),
  testCase('alegator:', 401, 'Login and password should be specified'),
  testCase(':good_job', 401, 'Login and password should be specified'),
  testCase('saym:onloh', 403, 'Incorrect login or password :('),
  testCase('alegator:bad_job', 403, 'Incorrect login or password :('),
];

const getOptionsWithAuthorization = credentials => {
  const credentialsBase64 = Buffer.from(credentials).toString('base64');
  let options = { 
      headers: { 
        Authorization: `Basic ${ credentialsBase64 }` 
      }
  };
  return options;
};

const checkStatusCode = (statusCode, expectedCode, path, credentials) => {
  assert.strictEqual(
    statusCode, expectedCode,
    `Wrong status code, expected ${expectedCode}, got ${statusCode}
    Path: ${path}
    Credentials: ${credentials}`
  );
};

const checkMsg = (msg, expected, path, credentials) => {
  assert.strictEqual(
    JSON.parse(msg), `&#127819${expected}`, 
    `Wrong error msg, expected &#127819${expected}, got ${msg}
    Path: ${path}
    Credentials: ${credentials}`
  );
};

const logSuccess = (path, credentials, statusCode, msg) => {
  console.log(
    `Test successful: ${path} ${credentials}, code: ${statusCode},
    got msg: ${msg.toString()}\n`
  );
};

const testPath = path => {
  const fullPath = url + path;
  for (const test of tests) {
    const { credentials, code, expected } = test;
    let options = (credentials === 'Anauthorized') ?
      {} : getOptionsWithAuthorization(credentials);
    const req = http.get(fullPath, options, res => {
      const { statusCode } = res;
      checkStatusCode(statusCode, code, path, credentials);
      if (statusCode === 200) return;
      res.on('data', msg => {
        checkMsg(msg, expected, path, credentials);
        logSuccess(path, credentials, statusCode, msg);
      });
    });
    req.setTimeout(3000, () => assert.fail('Request timed out'));
  }
};

const testWrongPath = () => {
  const wrongPath = 'gfdfsgdf/';
  const credentials = 'alegator:good_job';
  const options = getOptionsWithAuthorization(credentials);
  const expected = 'Page not found :(';
  http.get(url + wrongPath, options, res => {
    const { statusCode } = res;
    checkStatusCode(statusCode, 404, wrongPath, credentials);
    res.on('data', msg => {
      checkMsg(msg, expected, wrongPath, credentials);
      logSuccess('wrong path', credentials, statusCode, msg);
    });
  }).setTimeout(3000, () => assert.fail('Request timed out'));
};

const server = createServer(http, {});
server.listen(8000);
paths.forEach(testPath);
testWrongPath();
setTimeout(() => server.close(() => console.log('Tests finished')), 3000);
