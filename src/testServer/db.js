'use strict';

module.exports = {
  accounts: [{
    id: 1,
    name: 'Oleh',
    login: 'alegator',
    password: 'good_job'
  },
  {
    id: 2,
    name: 'Valera',
    login: 'valera_test',
    password: 'test'
  }],
  banks: [{
    id: 353,
    account: 1,
    name: 'mono',
    token: 'r32r3d3456' //idk how a token should look like, sorry
  },
  {
    id: 643,
    account: 2,
    name: 'mono',
    token: 'ghgf464ss4f'
  },
  {
    id: 420,
    account: 2,
    name: 'privat',
    token: 'vn5egr46s8'
  },
  {
    id: 786,
    account: 2,
    name: 'cash',
    token: 'r32r3d3456' //Not sure if we need it here
  }],
  cards: [{
    id: 321,
    bank: 353,
    num: 1234,
    type: 'black',
    balance: 3333,
    currency: 'UAH',
    token: '65yjy45fdh'
  },
  {
    id: 504,
    bank: 420,
    num: 4433,
    type: 'universal',
    balance: 420,
    currency: 'UAH',
    token: '45gfgj78dr'
  },
  {
    id: 657,
    bank: 786,
    num: 1111,
    type: 'cash',
    balance: 420,
    currency: 'UAH',
    token: 'fg445iy72m'
  }],
  transactions: [{
    id: 1,
    card: 321,
    amount: -1500,
    type: 'Cafe',
    date: '2020-10-12T10:25:19.833Z'
  },
  {
    id: 2,
    card: 504,
    amount: 69000,
    type: 'Salary',
    date: '2020-10-13T15:37:01.325Z'
  },
  {
    id: 3,
    card: 657,
    amount: -1236,
    type: 'Rent',
    date: '2020-10-18T14:10:23.753Z'
  }],
};
