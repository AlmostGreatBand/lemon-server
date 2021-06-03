'use strict';
// TODO: reduce line length to remove eslint disable
const http = require('https');
const BankDataSource = require('../BankDataSource');

class MonoDataSource extends BankDataSource {
  constructor() {
    super();
    this.ROUTES = {
      baseUrl: 'api.monobank.ua',
      transactions: '/personal/statement',
      personalInfo: '/personal/client-info',
    };
  }

  getTransactions(token, accounts) {
    const result = {};

    accounts.forEach(option => {
      const { account, from, to } = option;

      // eslint-disable-next-line max-len
      let queryString = `${this.ROUTES.transactions}/${account}/${from.getTime()}`;
      if (to) queryString += `/${to.getTime()}`;

      if (account !== undefined && from !== undefined) {
        result[account] = this._getData(token, queryString);
      } else {
        const errMessage = 'Error: account or from-date is not specified';
        console.error(errMessage);
        throw new Error(errMessage);
      }
    });
    return result;
  }

  getAccounts(token) {
    const queryString = this.ROUTES.personalInfo;
    return this._getData(token, queryString);
  }

  _makeRequest(token, path) {
    const options = {
      hostname: this.ROUTES.baseUrl,
      path,
      method: 'GET',
      headers: {
        'X-Token': token,
        'Content-Type': 'application/json; charset=UTF-8',
      }
    };
    return http.request(options);
  }

  _getData(token, path) {
    return new Promise((resolve, reject) => {
      const req = this._makeRequest(token, path);
      req.on('response', res => {
        if (res.statusCode !== 200) {
          // eslint-disable-next-line max-len
          const errMessage = `Error: code ${res.statusCode} message: ${res.statusMessage}`;
          console.error(errMessage);
          reject(errMessage);
        } else {
          let stream = '';
          res.on('data', chunk => {
            stream += chunk;
          });

          res.on('end', () => {
            try {
              resolve(JSON.parse(stream));
            } catch (e) {
              // eslint-disable-next-line max-len
              const errMessage = `Error: something went wront while trying to parse data: ${e}`;
              console.error(errMessage);
              reject(errMessage);
            }
          });
        }
      });

      req.on('error', err => {
        try {
          const e = JSON.parse(err);
          console.error(`Error: ${e.errorDescription}`);
          reject(e.errorDescription);
        } catch (e) {
          // eslint-disable-next-line max-len
          const errMessage = `Error: something went wront while trying to parse err: ${e}`;
          console.error(errMessage);
          reject(errMessage);
        }
      });

      req.end();
    });
  }
}

module.exports = MonoDataSource;
