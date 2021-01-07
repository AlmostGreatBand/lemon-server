'use strict';

const assert = require('assert').strict;
const https = require('https');
const fs = require('fs');

const url = 'https://localhost:8000/';
const options = {
  ca: [ fs.readFileSync('cert.pem') ],
};
const paths = [ 'profile/', 'cards/', 'transactions/', 'profile' ];
const tests = [
  ['alegator:good_job', 200, ''],
  ['Anauthorized', 401, '<h1>&#127819You should authorize to access the site</h1>'],
  [':', 401, '<h1>&#127819Login and password should be specified</h1>'],
  ['alegator:', 401, '<h1>&#127819Login and password should be specified</h1>'],
  [':good_job', 401, '<h1>&#127819Login and password should be specified</h1>'],
  ['saym:onloh', 403, '<h1>&#127819Incorrect login entered :(</h1>'],
  ['alegator:bad_job', 403, '<h1>&#127819Incorrect password entered :(</h1>'],
];

const getOptionsWithAuthorization = credentials => {
  const credentialsBase64 = Buffer.from(credentials).toString('base64');
  let currentOptions = { 
    ...options,
      headers: { 
        Authorization: `Basic ${ credentialsBase64 }` 
      }
  };
  return currentOptions;
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
    msg.toString(), expected, 
    `Wrong error msg, expected ${expected}, got ${msg}
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
    const [ credentials, code, expected ] = test;
    let currentOptions = (credentials === 'Anauthorized') ?
      options : getOptionsWithAuthorization(credentials);
    const req = https.get(fullPath, currentOptions, res => {
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
  const currentOptions = getOptionsWithAuthorization(credentials);
  const expected = '<h1>&#127819Page not found :(</h1>';
  https.get(url + wrongPath, currentOptions, res => {
    const { statusCode } = res;
    checkStatusCode(statusCode, 404, wrongPath, credentials);
    res.on('data', msg => {
      checkMsg(msg, expected, wrongPath, credentials);
      logSuccess('wrong path', credentials, statusCode, msg);
    });
  }).setTimeout(3000, () => assert.fail('Request timed out'));
};

paths.forEach(testPath);
testWrongPath();
