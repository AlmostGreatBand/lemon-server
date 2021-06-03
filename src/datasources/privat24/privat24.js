'use strict';

const http = require('https');
const xmlJs = require('xml-js');
const crypto = require('crypto');
const { fillTransactionsXml } = require('./utils/transactions');
const { fillBalanceXml } = require('./utils/balance');
const {
  stringToDate,
  dateToString,
  divideIntoPeriods
} = require('./utils/dates');

const BankDataSource = require('../BankDataSource');

class PrivatDataSource extends BankDataSource {
  constructor() {
    super();
  }

  createSignature(xml, password) {
    const regexp = /(?<=<data>).*(?=<\/data)/;
    const dataString = xml.match(regexp)[0];
    const md5Signature = crypto.createHash('md5')
      .update(`${dataString}${password}`, 'utf8')
      .digest('hex');
    const signature = crypto.createHash('sha1')
      .update(md5Signature, 'utf8')
      .digest('hex');
    return signature;
  }

  fillXmlWithSignature(xml, signature) {
    const xmlObj = xmlJs.xml2js(xml, { compact: true });

    const xmlMerchant = xmlObj.request.merchant;
    xmlMerchant.signature._text = signature;

    const xmlWithSignature = xmlJs.js2xml(xmlObj, {
      spaces: 0,
      compact: true,
      fullTagEmptyElement: true
    });
    return xmlWithSignature;
  }

  handleBankResponse(cb, resolve, reject, res) {
    let data = '';
    if (res.statusCode !== 200) {
      const errMsg = `Server did not send data. STATUS CODE: ${res.statusCode}`;
      reject(new Error(errMsg));
    }
    res.setEncoding('utf8');
    res.on('data', chunk => {
      data += chunk;
    });
    res.on('end', () => {
      cb(resolve, reject, data);
    });
    res.on('error', err => reject(err));
  }

  handleTransactionsData(resolve, reject, dataXml) {
    let dataObj;
    try {
      dataObj = xmlJs.xml2js(dataXml, { compact: true });
    } catch (err) {
      reject(new Error(err));
      return;
    }

    if (dataObj.response.data.error !== null) {
      const errorMessage = dataObj.response.data.error._attributes.message;
      reject(new Error(errorMessage));
      return;
    }

    const result = [];
    let transactions = dataObj.response.data.info.statements.statement;
    if (!Array.isArray(transactions)) transactions = [transactions];
    transactions.map(val => result.push(val._attributes));
    resolve(result);
  }

  handleBalanceData(resolve, reject, dataXml) {
    let dataObj;
    try {
      dataObj = xmlJs.xml2js(dataXml, { compact: true });
    } catch (err) {
      reject(new Error('Invalid XML'));
      return;
    }

    if (dataObj.response.data.error !== null) {
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
  }

  getData(dataForRequest, cb, path, xml) {
    const options = {
      hostname: 'api.privatbank.ua',
      path,
      method: 'POST',
      headers:
          { 'Content-Type': 'application/xml; charset=UTF-8' }
    };
    const req = http.request(options);

    const password = dataForRequest.merchantPassword;
    const signature = this.createSignature(xml, password);
    const xmlWithSignature = this.fillXmlWithSignature(xml, signature);
    req.write(xmlWithSignature);
    req.end();

    return new Promise((resolve, reject) => {
      const handler = this.handleBankResponse.bind(this, cb, resolve, reject);
      req.on('response', handler);
      req.on('error', err => reject(err));
    });
  }

  async getTransactionsData(dataForTransactions) {
    const startDate = stringToDate(dataForTransactions.startDate);
    const endDate = stringToDate(dataForTransactions.endDate);

    const periods = divideIntoPeriods(startDate, endDate);
    const promises = [];

    const path = '/p24api/rest_fiz';
    const xml = fillTransactionsXml(dataForTransactions);
    const cb = this.handleTransactionsData.bind(this);

    periods.forEach(period => {
      const copyDataForTransactions = Object.assign({}, dataForTransactions);
      copyDataForTransactions.startDate = dateToString(period[0]);
      copyDataForTransactions.endDate = dateToString(period[1]);
      promises.push(this.getData(copyDataForTransactions, cb, path, xml));
    });
    const transactions = await Promise.all(promises);

    const result = [];
    transactions.forEach(arr => result.push(...arr.reverse()));

    return result;
  }

  async getBalanceData(dataForBalance) {
    const result = [];
    const path = '/p24api/balance';
    const xml = fillBalanceXml(dataForBalance);
    const cb = this.handleBalanceData.bind(this);
    for (const data of dataForBalance) {
      result.push(this.getData(data, cb, path, xml));
    }
    return Promise.all(result);
  }

  // conf is similar to dataForTransactionsRequest
  async getTransactions(card, conf) {
    conf.cardNumber = card.cardNum + '';
    return this.getTransactionsData(conf);
  }
  /* additional method for getting balances of cards array
     conf is array of objects similar to dataForBalanceRequest */
  async getBalance(conf) {
    return this.getBalanceData(conf);
  }
}

module.exports = PrivatDataSource;
