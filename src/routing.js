'use strict';

const url = require('url');
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
  const cards = databaseInterface.getCards(account.id);
  return cards;
};

const transactionsHandler = (req, res) => {
  const cards = cardsHandler(req, res);
  if (!cards) return null;
  const transactions = databaseInterface.getTransactions(cards);
  return transactions;
};

const routing = {
  '/': () => '<h1>Welcome to Lemon&#127819 Server!</h1>',
  '/favicon.ico/': () => {}, //Debug, never mind
  '/profile/': (req, res) => profileHandler(req, res),
  '/cards/': (req, res) => cardsHandler(req, res),
  '/transactions/': (req, res) => transactionsHandler(req, res),
  '/registration/': () => '<h1>&#127819Registration process will be here</h1>',
};

module.exports = routing;
