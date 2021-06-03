'use strict';

/** Represents transaction with card
 *
 * @property {number} cardId - Card's id in Lemon DB.
 * @property {number} amount - Amount of money transfered during this
 * transaction. Amount is negative if money were transfered from card 
 * and positive in other case.
 * @property {string} type - Description of transaction.
 * This value is not determined by Lemon.
 * @property {Date} date - Transaction date in ISO 8601. */
class Transaction {
  constructor(cardId, amount, type, date) {
    this.cardId = cardId;
    this.amount = amount;
    this.type = type;
    this.date = date;
  }
}
