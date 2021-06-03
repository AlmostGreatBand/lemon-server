'use strict';

const repository = require('./datasources/LemonRepository.js');

const makeResponse = (code, data) => (
  { code, data }
);

const authentificate = user => user.login && user.password;

const badRequestResponse = makeResponse(401, { error: '&#127819Login and password should be specified'});
const userErrorResponse = makeResponse(403, { error: '&#127819Permission denied' });
const serverErrorResponse = makeResponse(501, { error:'&#127819Lemon server is feeling bad' });

const expectedUserErrors = [
  'Account Not Found',
  'Account Has No Token',
  'Wrong password',
  'No cards present',
  'Card Not Found',
];

const getProfile = user => {
  if (!authentificate(user)) return badRequestResponse;
  const { profile, error } = repository.getUserInfo(user);
  if (!error) return makeResponse(200, profile);
  if (expectedUserErrors.includes(error.message)) return userErrorResponse;
  return serverErrorResponse;
};

const getCards = user => {
  if (!authentificate(user)) return badRequestResponse;
  const { cards, error } = repository.getCards(user);
  if (!error) return makeResponse(200, { cards });
  if (expectedUserErrors.includes(error.message)) return userErrorResponse;
  return serverErrorResponse;
};

const getTransactions = user => {
  if (!authentificate(user)) return badRequestResponse;
  const { transactions, error } = repository.getTransactions(user);
  if (!error) return makeResponse(200, { transactions });
  if (expectedUserErrors.includes(error.message)) return userErrorResponse;
  return serverErrorResponse;
};

const registerUser = user => {
  if (!authentificate(user)) return badRequestResponse;
  const { ok, error } = repository.setUser(user);
  const accExistsMsg = `Account with login ${user.login} already exists`;
  if (error.message === accExistsMsg) {
    return makeResponse(401, accExistsMsg);
  };
  return serverErrorResponse;
};

const changeUserInfo = (user, newInfo) => {
  if (!authentificate(user)) return badRequestResponse;
  const { ok, error } = repository.changeUserInfo(newInfo);
  if (!error) return makeResponse(200, { ok });
  if (expectedUserErrors.includes(error.message)) return userErrorResponse;
  return serverErrorResponse;
};

const setCards = user => {
  if (!authentificate(user)) return badRequestResponse;
  const { ok, error } = repository.setCard(user);
  if (!error) return makeResponse(200, { ok });
  if (expectedUserErrors.includes(error.message)) return userErrorResponse;
  return serverErrorResponse;
};

const addTransaction = (user, transaction) => {
  if (!authentificate(user)) return badRequestResponse;
  const { ok, error } = repository.setTransaction(transaction);
  if (!error) return makeResponse(200, { ok });
  if (expectedUserErrors.includes(error.message)) return userErrorResponse;
  return serverErrorResponse;
};

const routing = {
  'GET': {
    '/': () => makeResponse(200, 'Welcome to Lemon&#127819 Server!'),
    '/profile/': user => getProfile(user),
    '/cards/': user => getCards(user),
    '/transactions/': user => getTransactions(user),
  },
  'POST': {
    '/': () => makeResponse(200, 'Welcome to Lemon&#127819 Server!'),
    '/profile/': (user, newInfo) => changeUserInfo(user, newInfo),
    '/banks/add/': async (user, bank) => {
      const res = setBank(user, bank);
      if (res.error) return res;
      return await setCards(user);
    },
    '/transactions/': (user, transaction) => addTransaction(user, transaction),
    '/registration/': (_, user) => registerUser(user),
  },
};

module.exports = routing;
