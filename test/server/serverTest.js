'use strict';

const assert = require('assert').strict;
const http = require('http');
const fs = require('fs');
const createServer = require('../../src/testServer/testServer.js');

const url = 'http://localhost:8000/';
const paths = [ 'profile/', 'cards/', 'transactions/', 'profile' ];
const expectedResults = {
  'profile/': {
    account_id: 1,
    name: 'Oleh',
    login: 'alegator',
    password: 'good_job'
  },
  'cards/': {
    cards: [{
      card_id: 321,
      bank_id: 353,
      bank: 'Mono',
      card_num: 1234,
      type: 'black',
      balance: 3333,
      currency: 'UAH',
      token: '65yjy45fdh'
    }]
  },
  'transactions/': {
    transactions: [{
      transaction_id: 1,
      card_id: 321,
      amount: -1500,
      type: 'Cafe',
      date: '2020-10-12T10:25:19.833Z'
    }]
  },
  'profile': {
    account_id: 1,
    name: 'Oleh',
    login: 'alegator',
    password: 'good_job'
  },
};

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

const getOptions = credentials => {
  if (credentials === 'Unauthorized') return {};
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

const checkResponseData = (data, path) => {
  const expected = JSON.stringify(expectedResults[path]);
  assert.strictEqual(data, expected, `Wrong response data, expected: 
    ${expected}, 
    got: 
    ${data}
    Path: ${path}`);
};

const logSuccess = (path, credentials, statusCode, responseData) => {
  console.log(
    `Test successful: ${path} ${credentials}, code: ${statusCode},
    got response: ${responseData.toString()}\n`
  );
};

const testRequest = async (path, test) => {
  counter++;
  const { credentials, code, expected } = test;
  let options = getOptions(credentials);
  const req = http.get(url + path, options, async res => {
    const { statusCode } = res;
    checkStatusCode(statusCode, code, path, credentials);
    if (statusCode === 200) {
      counter--;
      const buffers = [];
      for await (const chunk of res) buffers.push(chunk);
      const data = Buffer.concat(buffers).toString();
      checkResponseData(data, path);
      logSuccess(path, credentials, statusCode, data);
      if (counter <= 0) server.close(() => console.log('Tests finished'));
      return;
    };
    res.on('data', msg => {
      counter--;
      checkMsg(msg, expected, path, credentials);
      logSuccess(path, credentials, statusCode, msg);
      if (counter <= 0) server.close(() => console.log('Tests finished'));
    });
  });
  req.setTimeout(3000, () => assert.fail('Request timed out'));
};

const testPath = async path => {
  for (const test of tests) {
    await testRequest(path, test);
  }
};

const testWrongPath = async () => {
  const wrongPath = 'gfdfsgdf/';
  const wrongPathTest = testCase(
    'alegator:good_job', 404, 'Page not found :('
  );
  await testRequest(wrongPath, wrongPathTest);
};

const server = createServer(http);
server.listen(8000);

(async () => {
  try {
    await paths.forEach(testPath);
    await testWrongPath();
  } catch(err) {
    console.error(err);
  }
})();
