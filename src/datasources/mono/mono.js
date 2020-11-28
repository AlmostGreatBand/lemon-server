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
        }
        else {
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

    #getData = async (path) => {
        console.log(this.token);
        const req = this.#makeRequest(path);
        console.log(req);
        req.on('response', res => {
            if (res.statusCode !== 200) {
                const errMessage = `Error: code ${res.statusCode} message: ${res.statusMessage}`;
                console.log(errMessage);
                throw new Error(errMessage);
            } else {
                let stream = '';
                res.on('data', chunk => {
                    stream += chunk;
                });

                res.on('end', () => {
                    try {
                        const data = JSON.parse(stream);
                        console.log(data);
                        return data;
                    } catch(e) {
                        const errMessage = `Error: something went wront while trying to parse data: ${e}`;
                        console.log(errMessage);
                        throw new Error(errMessage);
                    }
                })
            }
        });
    
        req.on('error', err => {
            try {
                console.log(err.toString());
                const e = JSON.parse(err);
                console.log(`Error: ${e.errorDescription}`);
                return e;
            } catch(e) {
                console.log(`Error: something went wront while trying to parse err: ${e}`);
            }
        }); 

        req.end();
    };
}

// Usage

const monoDS = new MonoDataSource('uMLmvCFm6kA4N8mrflxayXMcZPqFUrxpm9q_CxBsMkaY');
(async () => {
    const transactions = await monoDS.getTransactions(0, new Date(2020, 10, 15), new Date(2020, 10, 26));
})();

module.exports = MonoDataSource;
