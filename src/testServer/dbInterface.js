'use strict';

const db = require('./db.js');

const getAccount = login => (
  db.accounts.find(acc => acc.login === login)
);

const getBanks = accId => (
  db.banks.filter(bank => bank.account === accId)
);

const getCards = accId => {
  const bankIds = getBanks(accId).map(bank => bank.bank_id);
  return db.cards.filter(card => bankIds.includes(card.bank_id));
};

const getTransactions = cards => {
  const cardIds = cards.map(card => card.card_id);
  return db.transactions.filter(trans => cardIds.includes(trans.card_id));
};

module.exports = { getAccount, getCards, getTransactions };
