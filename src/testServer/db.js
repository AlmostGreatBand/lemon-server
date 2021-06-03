'use strict';
/* eslint-disable camelcase */
const supportedBanks = require('../datasources/supportedBanks');

module.exports = {
  accounts: [{
    account_id: 1,
    name: 'Oleh',
    login: 'alegator',
    password: 'good_job'
  },
  {
    account_id: 2,
    name: 'Valera',
    login: 'valera_test',
    password: 'test'
  }],
  banks: [{
    bank_id: 353,
    account: 1,
    name: 'mono',
    token: 'r32r3d3456' //idk how a token should look like, sorry
  },
  {
    bank_id: 643,
    account: 2,
    name: 'mono',
    token: 'ghgf464ss4f'
  },
  {
    bank_id: 420,
    account: 2,
    name: 'privat',
    token: 'vn5egr46s8'
  },
  {
    bank_id: 786,
    account: 2,
    name: 'cash',
    token: 'r32r3d3456' //Not sure if we need it here
  }],
  cards: [{
    card_id: 321,
    bank_id: 353,
    bank: supportedBanks.MONO,
    card_num: 1234,
    type: 'black',
    balance: 3333,
    currency: 'UAH',
    token: '65yjy45fdh'
  },
  {
    card_id: 504,
    bank_id: 420,
    bank: supportedBanks.PRIVAT,
    card_num: 4433,
    type: 'universal',
    balance: 420,
    currency: 'UAH',
    token: '45gfgj78dr'
  },
  {
    card_id: 657,
    bank_id: 786,
    bank: supportedBanks.CASH,
    card_num: 1111,
    type: 'cash',
    balance: 420,
    currency: 'UAH',
    token: 'fg445iy72m'
  }],
  transactions: [{
    transaction_id: 1,
    card_id: 321,
    amount: -1500,
    type: 'Cafe',
    date: '2020-10-12T10:25:19.833Z'
  },
  {
    transaction_id: 2,
    card_id: 504,
    amount: 69000,
    type: 'Salary',
    date: '2020-10-13T15:37:01.325Z'
  },
  {
    transaction_id: 3,
    card_id: 657,
    amount: -1236,
    type: 'Rent',
    date: '2020-10-18T14:10:23.753Z'
  }],
};
