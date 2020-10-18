'use strict';

const https = require('https');
const fs = require('fs');
const url = require('url');

const options = {
  key: fs.readFileSync('../key.pem'),
  cert: fs.readFileSync('../cert.pem'),
};

const db = {
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

const getAccount = login => {
  for (const acc of db.accounts) {
    if (acc.login === login) return acc;
  }
  return null;
};

const getBanks = accId => {
  const banks = [];
  for (const bank of db.banks) {
    if (bank.account === accId) banks.push(bank);
  }
  return banks;
};
const getCards = accId => {
  const banks = getBanks(accId);
  const cards = [];
  for (const card of db.cards) {
    for (const bank of banks) {
      if (card.bank === bank.id) cards.push(card);
    }
  }
  return cards;
};

const getTransactions = cards => {
  const transactions = [];
  for (const transaction of db.transactions) {
    for (const card of cards) {
      if (transaction.card === card.id) {
        transactions.push(transaction);
      }
    }
  }
  return transactions;
};

const authentificate = (login, password) => {
  if (!login || !password) return { 
    err: '<h1>&#127819Login and password should be specified</h1>',
    account: null
  };
  const account = getAccount(login);
  if (!account) return {
    err: '<h1>&#127819Incorrect login entered :(</h1>',
    account: null 
  };
  if (password !== account.password) return { 
    err: '<h1>&#127819Incorrect password entered :(</h1>', 
    account: null 
  };
  return { err: null, account: account };
};

const profileHandler = (req, res) => {
  const login = url.parse(req.url, true).query.login; //const login = req.getHeader('login');
  const password = url.parse(req.url, true).query.password; //const password = req.getHeader('password');
  const { err, account } = authentificate(login, password);
  if (err) {
    res.writeHead(403);
    res.end(err);
    return null;
  }
  return account;
};

const cardsHandler = (req, res) => {
  const account = profileHandler(req, res);
  if (!account) return null;
  const cards = getCards(account.id);
  return cards;
};

const transactionsHandler = (req, res) => {
  const cards = cardsHandler(req, res);
  if (!cards) return null;
  const transactions = getTransactions(cards);
  return transactions;
};

const routing = {
  '/': () => '<h1>Welcome to Lemon&#127819 Server!</h1>',
  '/favicon.ico/': () => {}, //Debug, never mind
  '/profile/': (req, res) => profileHandler(req, res),
  '/cards/': (req, res) => cardsHandler(req, res),
  '/transactions/': (req, res) => transactionsHandler(req, res),
  '/registration': () => '<h1>&#127819Registration process will be here</h1>',
};

const normalizePath = pathname => (
  pathname.endsWith('/') ? pathname : pathname + '/'
);

const server = https.createServer(options, (req, res) => {
  const { pathname } = url.parse(req.url, true);
  const handler = routing[normalizePath(pathname)];
  if (!handler) {
    res.writeHead(404);
    return res.end('<h1>&#127819Page not found :(</h1>');
  }
  const data = handler(req, res);
  if (!data) return;
  res.writeHead(200);
  res.end((typeof data === 'string') ? data : JSON.stringify(data));
});

server.listen(8000);
console.log('Test server goes brrrrrrrrrrrr');
