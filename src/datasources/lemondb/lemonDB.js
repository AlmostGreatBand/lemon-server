/* eslint-disable */
'use strict';

/** @class LemonDB represents data access layer of the Lemon🍋 */
class LemonDB {
  /** Creates an instance of LemonDB
     * @constructor */
  constructor(
    /* maybe some db connection, driver, etc */
  ) {
    // TODO: not yet implemented
  }

  /** @return User */
  async getUser(name) {
    // TODO: not yet implemented
  }

  /** Add new or edit existing user
     * @return User
     * @returns User instance if succeed or throws error otherwise
     * @throws error if User cannot be saved */
  async setUser(user) {
    // TODO: not yet implemented
  }

  /** @return Array<User> */
  async getCards(user) {
    // TODO: not yet implemented
  }

  /** @return boolean */
  async deleteCard(card) {
    // TODO: not yet implemented
  }

  /** Add new or edit existing card
     * @return Card
     * @returns Card instance if succeed or throws error otherwise
     * @throws error if Card cannot be saved */
  async setCard(card) {
    // TODO: not yet implemented
  }

  /** Returns list of user's transactions
     * @return Array<Transaction>*/
  async getTransactions(user) {
    // TODO: not yet implemented
  }

  /** Add or edit transaction
     * @return boolean
     * @returns true if succeed and false otherwise */
  async setTransaction(transaction) {
    // TODO: not yet implemented
  }

  /** @return boolean */
  async deleteTransaction(transaction) {
    // TODO: not yet implemented
  }
}
