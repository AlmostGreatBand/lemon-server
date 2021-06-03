'use strict';

const MonoDataSource = require('./mono.js');
const monoDS = new MonoDataSource();

const getTransactions = async accounts => {
  try {
    const result = monoDS.getTransactions(process.env.MONO_TOKEN, accounts);
    for (const [acc, trs] of Object.entries(result)) {
      const transactions = await trs;
      console.log(`account: ${acc} \ntransactions:\n`, transactions);
    }
  } catch (e) {
    console.error(e);
  }
};

const getAccounts = async () => {
  try {
    const accounts = await monoDS.getAccounts(process.env.MONO_TOKEN);
    console.log(accounts);
  } catch (e) {
    console.error(e);
  }
};

// Usage
const accounts = [
  {
    /* 0 - default param for mono accounts */
    account: '0',
    from: new Date(2020, 10, 15),
    to: new Date(2020, 10, 16),

  },
  {
    account: 'account-name',
    from: new Date(2020, 10, 15),
    to: new Date(2020, 10, 16),
  },
];

const accountsFailed = [
  {
    account: '-1',
    from: new Date(2020, 10, 15),
    to: new Date(2020, 10, 16),
  },
];

const accountWithoutTo = [
  {
    /* 0 - default param for mono accounts */
    account: '0',
    from: new Date(2021, 0, 6),
  },
];

(async () => {
  // Scenario 1: get transactions
  console.log('---Scenario 1---');
  await getTransactions(accounts);

  // Scenario 2: get accounts
  console.log('---Scenario 2---');
  await getAccounts();

  // Scenario 3: get transactions with invalid account
  console.log('---Scenario 3---');
  await getTransactions(accountsFailed);

  // Scenario 4: get transactions without _to_ date
  console.log('---Scenario 4---');
  await getTransactions(accountWithoutTo);
})();
