/* eslint-disable camelcase */
'use strict';

const db = require('./db.js');
const {
  monoCardCopy,
  monoTrCopy
} = require('./dbutils');

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

const getCardTransactions = card => (
  db.transactions.filter(trs => trs.card_id === card.card_id)
);

const getLastTransaction = card => {
  const transactions =  getCardTransactions(card);
  if (transactions.length === 0) {
    return null;
  }
  let latestTransaction = transactions[0];
  for (const value of db.transactions) {
    const valueDate = new Date(value.date);
    const latestDate = new Date(latestTransaction.date);
    if (valueDate.getTime() > latestDate.getTime()) {
      latestTransaction = value;
    }
  }
  return latestTransaction;
};

const setMonoTransactions = transactions => {
  transactions.forEach(tr => {
    tr.transaction_id = db.transactions.length + 1;
    tr = monoTrCopy;
  });
  db.transactions.push(...transactions);
};

const updateAccount = user => {
  const index = db.accounts.findIndex(acc => acc.login === user.login);
  for (const [key, value] of Object.entries(user)) {
    db.accounts[index][key] = value;
  }
};

const setAccount = user => {
  user.account_id = db.accounts.length;
  db.accounts.push(user);
  return true;
};

const getMonobank = user => (
  getBanks(user.account_id).filter(bank => bank.name === 'mono')
);

const setMonoCards = (cards, user) => {
  const bank = getMonobank(user);
  const allCards = getCards(user.account_id);
  cards.forEach(card => {
    card.bank_id = bank.bank_id;
    card.card_id = allCards[allCards.length - 1].card_id + 1;
    card.bank = 'mono';
    card = monoCardCopy(card);
  });
  db.cards.push(...cards);
  return true;
};

const checkCard = cardId => (
  db.cards.find(card => card.card_id === cardId)
);

const deleteCard = cardId => {
  const index = db.cards.findIndex(card => card.card_id === cardId);
  db.cards.splice(index, 1);
  return true;
};

const setBank = (accId, bank) => {
  bank.account_id = accId;
  bank.bank_id = db.banks[db.banks.length].bank_id + 1;
  db.banks.push(bank);
  return true;
};

module.exports = {
  getAccount,
  getCards,
  getTransactions,
  setAccount,
  setMonoCards,
  updateAccount,
  deleteCard,
  checkCard,
  getMonobank,
  setBank,
  getCardTransactions,
  getLastTransaction,
  setMonoTransactions
};
