'use strict'; 

const http = require('https');
const BankDataSource = require('../BankDataSource');

class MonoDataSource extends BankDataSource {
    static #ROUTES = {
        baseUrl: 'api.monobank.ua',
        transactions: '/personal/statement',
        personalInfo: '/personal/client-info',
    }

    constructor(token) {
        super();
        this.token = token;
    }

    async getTransactions(account, from, to) {
        let queryString = `${MonoDataSource.#ROUTES.transactions}/${account}/${from.getTime()}`;
        if (to) queryString += `/${to.getTime()}`;

        if (account !== undefined && from !== undefined) {
            return this.#getData(queryString);
        } else {
            const errMessage = 'Error: account or from-date is not specified';
            console.log(errMessage);
            throw new Error(errMessage);
        }
    }

    async getAccounts(token) {
        const queryString = MonoDataSource.#ROUTES.personalInfo;
        return this.#getData(queryString, token);
    }

    #makeRequest = (path) => {
        const options = {
            hostname: MonoDataSource.#ROUTES.baseUrl,
            path: path,
            method: 'GET',
            headers: {
                'X-Token': this.token,
                'Content-Type': 'application/json; charset=UTF-8',
            }
        };
        return http.request(options);
    }

    #getData = async (path) => new Promise((resolve, reject) => {
        const req = this.#makeRequest(path);
        req.on('response', res => {
            if (res.statusCode !== 200) {
                const errMessage = `Error: code ${res.statusCode} message: ${res.statusMessage}`;
                console.log(errMessage);
                reject(errMessage);
            } else {
                let stream = '';
                res.on('data', chunk => {
                    stream += chunk;
                });

                res.on('end', () => {
                    try {
                        resolve(JSON.parse(stream));
                    } catch(e) {
                        const errMessage = `Error: something went wront while trying to parse data: ${e}`;
                        console.log(errMessage);
                        reject(errMessage);
                    }
                })
            }
        });
    
        req.on('error', err => {
            try {
                const e = JSON.parse(err);
                console.log(`Error: ${e.errorDescription}`);
                reject(e.errorDescription);
            } catch(e) {
                const errMessage = `Error: something went wront while trying to parse err: ${e}`;
                console.log(errMessage);
                reject(errMessage);
            }
        }); 

        req.end();
    });
}

module.exports = MonoDataSource;
