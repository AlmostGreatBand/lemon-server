'use strict';

const databaseInterface = require('./dbInterface.js');

const makeResponse = (code, data) => (
  { code, data }
);

const authentificate = (login, password) => {
  if (!login || !password) return {
    err: '&#127819Login and password should be specified',
    code: 401,
    account: null
  };
  const account = databaseInterface.getAccount(login);
  if (!account || password !== account.password) return {
    err: '&#127819Incorrect login or password :(',
    code: 403,
    account: null
  };
  return { err: null, code: 200, account };
};

const profileHandler = credentials => {
  const login = credentials[0];
  const password = credentials[1];
  const { err, code, account } = authentificate(login, password);
  const responseData = err ? { error: err } : account;
  return makeResponse(code, responseData);
};

const cardsHandler = credentials => {
  const result = profileHandler(credentials);
  const account = result.data;
  if (account.error) return result;
  const cards = databaseInterface.getCards(account.id);
  return makeResponse(result.code, { "cards": cards });
};

const transactionsHandler = credentials => {
  const result = cardsHandler(credentials);
  const cards = result.data;
  if (cards.error) return result;
  const transactions = databaseInterface.getTransactions(cards);
  return makeResponse(result.code, { "transactions": transactions });
};

const routing = {
  '/': () => makeResponse(200, 'Welcome to Lemon&#127819 Server!'),
  '/profile/': credentials => profileHandler(credentials),
  '/cards/': credentials => cardsHandler(credentials),
  '/transactions/': credentials => transactionsHandler(credentials),
  '/registration/': () => (
    makeResponse(200, '&#127819Registration process will be here')
  ),
};

module.exports = routing;
