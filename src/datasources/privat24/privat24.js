'use strict';

const http = require('https');
const xmlJs = require('xml-js');
const crypto = require('crypto');
const {fillTransactionsXml} = require('./utils/transactions');
const {fillBalanceXml} = require('./utils/balance');
const {
  stringToDate, 
  dateToString, 
  divideIntoPeriods
} = require('./utils/dates');

const createSignature = (xml, password) => {
  const regexp = /(?<=<data>).*(?=<\/data)/;
  const dataString = xml.match(regexp)[0];
  const md5Signature = crypto.createHash('md5')
    .update(`${dataString}${password}`, 'utf8')
    .digest('hex');
  const signature = crypto.createHash('sha1')
    .update(md5Signature, 'utf8')
    .digest('hex');
  return signature;
};

const fillXmlWithSignature = (xml, signature) => {
  const xmlObj = xmlJs.xml2js(xml, {compact: true});

  const xmlMerchant = xmlObj.request.merchant;
  xmlMerchant.signature._text = signature;

  const xmlWithSignature = xmlJs.js2xml(xmlObj, {
    spaces: 0, 
    compact: true, 
    fullTagEmptyElement: true
  });
  return xmlWithSignature;
};

const handleBankResponse = (cb, resolve, reject, res) => {
  let data = '';
  if (res.statusCode != 200) {
    const errMsg = `Server did not send data. STATUS CODE: ${res.statusCode}`;
    reject(new Error(errMsg));
  }
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    cb(resolve, reject, data);
  });
  res.on('error', err => reject(err));
};

const handleTransactionsData = (resolve, reject, dataXml) => {
  let dataObj;
  try {
    dataObj = xmlJs.xml2js(dataXml, {compact: true});
  } catch (err) {
    reject(new Error(err));
    return;
  }

  if (dataObj.response.data.error != null) {
    const errorMessage = dataObj.response.data.error._attributes.message;
    reject(new Error(errorMessage));
    return;
  }

  const result = [];
  let transactions = dataObj.response.data.info.statements.statement;
  if (!Array.isArray(transactions)) transactions = [transactions];
  transactions.map(val => result.push(val._attributes));
  resolve(result);
};

const handleBalanceData = (resolve, reject, dataXml) => {
  let dataObj;
  try {
    dataObj = xmlJs.xml2js(dataXml, {compact: true});
  } catch (err) {
    reject(new Error('Invalid XML'));
    return;
  }

  if (dataObj.response.data.error != null) {
    const errorMessage = dataObj.response.data.error._attributes.message;
    reject(new Error(errorMessage));
    return;
  }
  const cardBalance = dataObj.response.data.info.cardbalance;
  const card = cardBalance.card;

  const result = {
    cardNumber: card.card_number._text,
    currency: card.currency._text,
    balance: cardBalance.balance._text,
    availableBalance: cardBalance.av_balance._text,
    dateBalance: cardBalance.bal_date._text,
    creditLimit: cardBalance.fin_limit._text
  };
  resolve(result);
};

const getData = (dataForRequest, cb) => {
  const path = cb.name === 'handleTransactionsData' ? '/p24api/rest_fiz'
    : cb.name === 'handleBalanceData' ? '/p24api/balance' 
      : null;
  const options = {
    hostname: 'api.privatbank.ua',
    path: path,
    method: 'POST',
    headers:
        {'Content-Type': 'application/xml; charset=UTF-8'}
  };
  const req = http.request(options);
  const xml = cb.name === 'handleTransactionsData' ? 
    fillTransactionsXml(dataForRequest)
    : cb.name === 'handleBalanceData' ? fillBalanceXml(dataForRequest) 
      : null;

  const signature = createSignature(xml, dataForRequest.merchantPassword);
  const xmlWithSignature = fillXmlWithSignature(xml, signature);
  req.write(xmlWithSignature);
  req.end();

  return new Promise((resolve, reject) => {
    req.on('response', handleBankResponse.bind(null, cb, resolve, reject));
    req.on('error', err => reject(err));
  });
};

const getTransactionsData = async dataForTransactions => {
  const startDate = stringToDate(dataForTransactions.startDate);
  const endDate = stringToDate(dataForTransactions.endDate);

  const periods = divideIntoPeriods(startDate, endDate);
  const promises = [];

  periods.forEach((period, index) => {
    const copyDataForTransactions = Object.assign({}, dataForTransactions);
    copyDataForTransactions.startDate = dateToString(period[0]);
    copyDataForTransactions.endDate = dateToString(period[1]);
    promises[index] = getData(copyDataForTransactions, handleTransactionsData);
  });
  const transactions = await Promise.all(promises);

  let result = [];
  for (const array of transactions) result = [...result, ...array.reverse()];

  return {transactions: result};
};

const getBalanceData = async dataForBalance => {
  const result = [];
  for (const data of dataForBalance) {
    result.push(getData(data, handleBalanceData));
  }
  return Promise.allSettled(Object.values(result));
};

const dataForTransactionsRequest = { // sample data for transactions request
  merchantPassword: '55x3Ft9C96yx7s1cAMO2KVn1apuDA0X6',
  merchantId: 123456,
  wait: 10,
  test: 0,
  paymentId: '',
  startDate: '11.05.2020',
  endDate: '23.10.2020',
  cardNumber: '1234567890123456'
};

const dataForBalanceRequest = { // sample data for balance request
  merchantPassword: '55x3Ft9C96yx7s1cAMO2KVn1apuDA0X6',
  merchantId: 123456,
  wait: 10,
  test: 0,
  paymentId: '',
  cardNumber: '1234567890123456',
  country: 'UA'
};

(async () => {
  const tranData = await getTransactionsData(dataForTransactionsRequest);
  const balanceData = await getBalanceData(dataForBalanceRequest);
  // dataForBalanceRequest can be array of data objects
  console.log(tranData);
  console.log(balanceData);
})();
