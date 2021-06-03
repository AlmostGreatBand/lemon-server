'use strict';

/** Represents bank card
 *
 * @property {number} cardId - Card's id in Lemon DB.
 * @property {string} bank - Name of the bank card belongs to
 * @property {number} cardNum - Card number (can be either all number or last 4 digits only)
 * @property {string} type - Card type in bank's system
 * @property {number} balance - Amount of money on card in lowest units
 * @property {string} currency - Currency of transactions from this cards */
class Card {
  constructor(cardId, bank, cardNum, type, balance, currency) {
    this.cardId = cardId;
    this.bank = bank;
    this.cardNum = cardNum;
    this.type = type;
    this.balance = balance;
    this.currency = currency;
  }
}
