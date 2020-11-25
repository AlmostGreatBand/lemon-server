'use strict'; 

const http = require('http');
const BASE_URL = 'api.monobank.ua'

const getTransactions = (account, from, to) => {
    const options = {
        hostname: BASE_URL,
        path: `/personal/statement/${account}/${from}`,
        method: 'GET',
        headers: {
            'X-Token': 'uMLmvCFm6kA4N8mrflxayXMcZPqFUrxpm9q_CxBsMkaY',
            'Content-Type': 'application/json; charset=UTF-8',
        }
    };
    let req = http.request(options)
    req.on('response', res => res.on('data', body => console.log(body)))
    req.on('error', err => console.log(err))
    req.end()
}


// Usage

let today = new Date()
getTransactions(0, 1604000000000)