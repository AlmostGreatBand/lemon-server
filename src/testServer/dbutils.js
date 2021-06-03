/* eslint-disable camelcase */
'use strict';
const {
  times: {
    second
  }
} = require('../datasources/utils');

const monoCardCopy = card => ({
  card_id: card.card_id,
  bank_id: card.bank_id,
  bank: card.bank,
  card_num: card.maskedPan,
  type: card.type,
  balance: card.balance,
  currency: card.cashbackType,
  bankCardId: card.id
});

const monoTrCopy = tr => ({
  transaction_id: tr.transaction_id,
  amount: tr.amount,
  date: new Date(tr.time * second),
  type: tr.description,
  bankCardId: tr.bankCardId
});

module.exports = {
  monoCardCopy,
  monoTrCopy
};
