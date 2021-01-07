/** Makes transactions to bank API */
class BankDataSource {
  /** Obtains transactions from card
   * @param {Card} card - get transactions from or to this card
   * @param {Object} conf - object with configuration fields: from, to, etc
   * @return {Array<Transaction>} */
  getTransactions(card, conf) {
    throw new Error('Not implemented');
  }
}

module.exports = { BankDataSource };
