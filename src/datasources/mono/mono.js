'use strict';

const http = require('https');
const BankDataSource = require('../BankDataSource');

class MonoDataSource extends BankDataSource {
  static #ROUTES = {
    baseUrl: 'api.monobank.ua',
    transactions: '/personal/statement',
    personalInfo: '/personal/client-info',
  }

  getTransactions(token, accounts) {
    const result = {};

    accounts.forEach(option => {
      const { account, from, to } = option;

      let queryString = `${MonoDataSource.#ROUTES.transactions}/${account}/${from.getTime()}`;
      if (to) queryString += `/${to.getTime()}`;

      if (account !== undefined && from !== undefined) {
        result[account] = this.#getData(token, queryString);
      } else {
        const errMessage = 'Error: account or from-date is not specified';
        console.error(errMessage);
        throw new Error(errMessage);
      }
    });
    return result;
  }

  getAccounts(token) {
    const queryString = MonoDataSource.#ROUTES.personalInfo;
    return this.#getData(token, queryString);
  }

  #makeRequest = (token, path) => {
    const options = {
      hostname: MonoDataSource.#ROUTES.baseUrl,
      path: path,
      method: 'GET',
      headers: {
        'X-Token': token,
        'Content-Type': 'application/json; charset=UTF-8',
      }
    };
    return http.request(options);
  }

  #getData = (token, path) => new Promise((resolve, reject) => {
    const req = this.#makeRequest(token, path);
    req.on('response', async res => {
      if (res.statusCode !== 200) {
        const errMessage = `Error: code ${res.statusCode} message: ${res.statusMessage}`;
        console.error(errMessage);
        reject(errMessage);
      } else {
        try {
          const stream = [];
          for await (const chunk of res) stream.push(chunk);
          resolve(JSON.parse(stream.join('')));
        } catch (e) {
          const errMessage = `Error: something went wront while trying to retrieve data: ${e}`;
          console.error(errMessage);
          reject(errMessage);
        }
      }
    });

    req.on('error', err => {
      try {
        const e = JSON.parse(err);
        console.error(`Error: ${e.errorDescription}`);
        reject(e.errorDescription);
      } catch (e) {
        const errMessage = `Error: something went wront while trying to parse err: ${e}`;
        console.error(errMessage);
        reject(errMessage);
      }
    }); 

    req.end();
  });
}

module.exports = MonoDataSource;
