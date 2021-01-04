'use strict';

const MonoDataSource = require('./mono.js')
const monoDS = new MonoDataSource(process.env.MONO_TOKEN);
(async () => {
    try {
        const transactions = await monoDS.getTransactions(undefined, new Date(2020, 10, 15), new Date(2020, 10, 26));
        console.log(transactions) 
    } catch(e) {
        /* Do smth logic here */
        console.log(e)
    }
})();
