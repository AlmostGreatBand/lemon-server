'use strict'; 

const http = require('https');
const BASE_URL = 'api.monobank.ua';
const TOKEN = 'uMLmvCFm6kA4N8mrflxayXMcZPqFUrxpm9q_CxBsMkaY'

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
    const options = createRequestBody
    req.on('response', res => {
        res.statusCode // handler
            res.on('data', body => {
                try {
                    // return to repo
                    console.log(JSON.parse(body))
                } catch(e) {
                    console.log(`Error: something went wront while trying to parse data: ${e}`) 
                }
            });
        }
    );
    req.on('error', err => {
        // return to repo
        console.log(JSON.parse(err))
    }); 
    req.end();
}

function getTransactions(token, account, from, to) {
    let queryString = `/personal/statement/${account}/${from}`;
    if (to) queryString += `/${to}`;
    if (account !== undefined && from !== undefined) return getData(queryString, token)
    else console.log("Error: account or from-date is not specified")
}

function getAccounts(token) {
    const queryString = 'personal/client-info'
    return getData(path, token)
}
// Usage

// getTransactions(TOKEN, 0, 1604000000000);
getAccounts(TOKEN)