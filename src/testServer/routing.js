'use strict';

const { URL } = require('url');
const databaseInterface = require('./dbInterface.js');

const authentificate = (login, password) => {
  if (!login || !password) return {
    err: '<h1>&#127819Login and password should be specified</h1>',
    account: null
  };
  const account = databaseInterface.getAccount(login);
  if (!account) return {
    err: '<h1>&#127819Incorrect login entered :(</h1>',
    account: null
  };
  if (password !== account.password) return {
    err: '<h1>&#127819Incorrect password entered :(</h1>',
    account: null
  };
  return { err: null, account };
};

const profileHandler = (credentials, res) => {
  const login = credentials[0];
  const password = credentials[1];
  const { err, account } = authentificate(login, password);
  if (err) {
    res.writeHead(403);
    res.end(err);
    return null;
  }
  return account;
};

const cardsHandler = (credentials, res) => {
  const account = profileHandler(credentials, res);
  if (!account) return null;
  const cards = databaseInterface.getCards(account.id);
  return { "cards": cards };
};

const transactionsHandler = (credentials, res) => {
  const cards = cardsHandler(credentials, res).cards;
  if (!cards) return null;
  const transactions = databaseInterface.getTransactions(cards);
  return { "transactions": transactions };
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
