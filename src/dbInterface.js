'use strict';

const db = require('./db.js');

const getAccount = login => (
  db.accounts.find(acc => acc.login === login)
);

const getBanks = accId => (
  db.banks.filter(bank => bank.account === accId)
);

const getCards = accId => {
  const bankIds = getBanks(accId).map(bank => bank.id);
  return db.cards.filter(card => bankIds.includes(card.bank));
};

const getTransactions = cards => {
  const cardIds = cards.map(card => card.id);
  return db.transactions.filter(trans => cardIds.includes(trans.card));
};

module.exports = { getAccount, getCards, getTransactions };
