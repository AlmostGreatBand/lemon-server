'use strict';

/** Makes transactions to bank API */
class BankDataSource {
  /** Obtains transactions from card
   * @param {Card} card - get transactions from or to this card
   * @param {Date} from - date of the earliest possible transaction
   * @param {Date} to - date of the latest possible transaction
   * @return {Array<Transaction>} */
  getTransactions(card, from, to) {
    throw new Error('Not implemented');
  }
}
