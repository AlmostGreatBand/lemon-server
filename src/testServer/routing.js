'use strict';

const databaseInterface = require('./dbInterface.js');

const authentificate = (login, password) => {
  if (!login || !password) return {
    err: '<h1>&#127819Login and password should be specified</h1>',
    code: 401,
    account: null
  };
  const account = databaseInterface.getAccount(login);
  if (!account || password !== account.password) return {
    err: '<h1>&#127819Incorrect login or password :(</h1>',
    code: 403,
    account: null
  };
  return { err: null, code: 200, account };
};

const profileHandler = (credentials, res) => {
  const login = credentials[0];
  const password = credentials[1];
  const { err, code, account } = authentificate(login, password);
  if (err) {
    res.writeHead(code);
    res.end(err);
    return null;
  }
  return account;
};

const cardsHandler = (credentials, res) => {
  const account = profileHandler(credentials, res);
  if (!account) return null;
  const cards = databaseInterface.getCards(account.id);
  return cards;
};

const transactionsHandler = (credentials, res) => {
  const cards = cardsHandler(credentials, res);
  if (!cards) return null;
  const transactions = databaseInterface.getTransactions(cards);
  return transactions;
};

const routing = {
  '/': () => '<h1>Welcome to Lemon&#127819 Server!</h1>',
  '/favicon.ico/': () => {}, //Debug, never mind
  '/profile/': (credentials, res) => profileHandler(credentials, res),
  '/cards/': (credentials, res) => cardsHandler(credentials, res),
  '/transactions/': (credentials, res) => transactionsHandler(credentials, res),
  '/registration/': () => '<h1>&#127819Registration process will be here</h1>',
};

module.exports = routing;
