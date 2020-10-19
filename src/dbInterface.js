'use strict';

const db = require('./db.js');

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

module.exports = { getAccount, getCards, getTransactions };
