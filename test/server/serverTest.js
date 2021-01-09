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
  testCase('Unauthorized', 401, 'You should authorize to access the site'),
  testCase(':', 401, 'Login and password should be specified'),
  testCase('alegator:', 401, 'Login and password should be specified'),
  testCase(':good_job', 401, 'Login and password should be specified'),
  testCase('saym:onloh', 403, 'Incorrect login or password :('),
  testCase('alegator:bad_job', 403, 'Incorrect login or password :('),
];

let counter = 0;

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
    JSON.parse(msg).error.toString(), `&#127819${expected}`, 
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

const testRequest = (path, test) => {
  counter++;
  const { credentials, code, expected } = test;
  let options = (credentials === 'Unauthorized') ?
    {} : getOptionsWithAuthorization(credentials);
  const req = http.get(url + path, options, res => {
    const { statusCode } = res;
    checkStatusCode(statusCode, code, path, credentials);
    if (statusCode === 200) return counter--;
    res.on('data', msg => {
      checkMsg(msg, expected, path, credentials);
      logSuccess(path, credentials, statusCode, msg);
      counter--;
      if (counter <= 0) server.close(() => console.log('Tests finished'));
    });
  });
  req.setTimeout(3000, () => assert.fail('Request timed out'));
};

const testPath = path => {
  for (const test of tests) {
    testRequest(path, test);
  }
};

const testWrongPath = () => {
  const wrongPath = 'gfdfsgdf/';
  const wrongPathTest = testCase(
    'alegator:good_job', 404, 'Page not found :('
  );
  testRequest(wrongPath, wrongPathTest);
};

const server = createServer(http, {});
server.listen(8000);
paths.forEach(testPath);
testWrongPath();
