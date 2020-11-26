'use strict'; 

const http = require('https');
const BASE_URL = 'api.monobank.ua';
/*
    this token should be passed from repository layer, it's here just for tests
*/ 
const TOKEN = 'uMLmvCFm6kA4N8mrflxayXMcZPqFUrxpm9q_CxBsMkaY';

function createRequestBody(path, token) {
    return {
        hostname: BASE_URL,
        path: path,
        method: 'GET',
        headers: {
            'X-Token': token,
            'Content-Type': 'application/json; charset=UTF-8',
        }
    };
}

function getData(path, token) {
    const options = createRequestBody(path, token);
    const req = http.request(options);
    req.on('response', res => {
        if (res.statusCode !== 200) {
            networkErrorHandler(res);
        } else {
            res.on('data', body => {
                try {
                    const data = JSON.parse(body);
                    console.log(data);
                    return data;
                } catch(e) {
                    console.log(`Error: something went wront while trying to parse data: ${e}`);
                }
            });
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
}

function getTransactions(token, account, from, to) {
    let queryString = `/personal/statement/${account}/${from}`;
    if (to) queryString += `/${to}`;
    if (account !== undefined && from !== undefined) return getData(queryString, token);
    else console.log("Error: account or from-date is not specified");
}

function getAccounts(token) {
    const queryString = '/personal/client-info';
    return getData(queryString, token);
}

function networkErrorHandler(e) {
    console.log(`Error: code ${e.statusCode} message: ${e.statusMessage}`)
    // maybe here will be some logic for different status codes
}

// Usage

getTransactions(TOKEN, 0, 1604000000000);
getAccounts(TOKEN);
