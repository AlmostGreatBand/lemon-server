'use strict';

const MonoDataSource = require('./mono.js')
const monoDS = new MonoDataSource(process.env.MONO_TOKEN);

const getTransactions = async (account, from, to) => {
    try {
        const transactions = await monoDS.getTransactions(account, from, to);
        console.log(transactions)
    } catch(e) {
        console.error(e)
    }
}

const getAccounts = async () => {
    try {
        const accounts = await monoDS.getAccounts();
        console.log(accounts)
    } catch(e) {
        console.error(e)
    }
}

(async () => {
    // Scenario 1: get transactions 
    console.log("---Scenario 1---")
    await getTransactions(0, new Date(2020, 10, 15), new Date(2020, 10, 26))

    // Scenario 2: get accounts
    console.log("---Scenario 2---")
    await getAccounts()

    // Scenario 3: get transactions with invalid account
    console.log("---Scenario 3---")
    await getTransactions(-3, new Date(2020, 10, 15), new Date(2020, 10, 26))

    // Scenario 4: get transactions without _to_ date
    console.log("---Scenario 4---")
    await getTransactions(0, new Date(2020, 11, 15))
})();
