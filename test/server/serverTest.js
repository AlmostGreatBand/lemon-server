'use strict';

const assert = require('assert').strict;
const https = require('https');
const fs = require('fs');

const url = 'https://localhost:8000/';
const options = {
  ca: [ fs.readFileSync('cert.pem') ],
};
const paths = [ 'profile/', 'cards/', 'transactions/', 'registration/', 'profile' ];
const tests = [
  ['alegator', 'good_job', ''],
  ['', '', '<h1>&#127819Login and password should be specified</h1>'],
  ['alegator', '', '<h1>&#127819Login and password should be specified</h1>'],
  ['', 'good_job', '<h1>&#127819Login and password should be specified</h1>'],
  ['saym', 'onloh', '<h1>&#127819Incorrect login entered :(</h1>'],
  ['alegator', 'bad_job', '<h1>&#127819Incorrect password entered :(</h1>'],
];

const testPath = path => {
  for (const test of tests) {
    const [ login, passwd, expected ] = test;
    const params = `?login=${login}&password=${passwd}`;
    const fullPath = url + path + params;
    const req = https.get(fullPath, options, res => {
      const { statusCode } = res;
      if (statusCode === 200) return;
      if (statusCode !== 403) assert.fail(`Request Failed.\nStatus Code: ${statusCode}`);
      res.on('data', msg => {
        assert.strictEqual(
          msg.toString(), expected, `Wrong error msg, expected ${expected}, got ${msg}`
        );
        console.log(`Test successful: ${fullPath}`);
        console.log(msg.toString() + '\n');
      });
    });
    req.setTimeout(3000, () => assert.fail('Request timed out'));
  }
};

paths.forEach(testPath);

const wrongPath = 'gfdfsgdf/';
https.get(url + wrongPath, options, res => {
  const { statusCode } = res;
  assert.strictEqual(
    statusCode, 404, `Wrong status code, expected 404, got ${statusCode}`
  );
  console.log('Test successful: wrong path');
}).setTimeout(3000, () => assert.fail('Request timed out'));
