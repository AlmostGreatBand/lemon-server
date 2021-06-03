'use strict';
const dbInterface = require('../testServer/dbInterface'); // temp db
const MonoDataSource = require('./mono/mono');
const { lastMonth } = require('./utils');

/** Unites local and remote datasources */
class LemonRepository {
  constructor() {
    this.db = dbInterface;
    this.monoDS = new MonoDataSource();
  }

  /** @return User, error */
  getUserInfo(user) {
    const profile = this.db.getAccount(user.login);
    if (!profile) {
      return { profile: null, error: new Error('Account Not Found') };
    }
    if (user.password !== profile.password) {
      return { profile: null, error: new Error('Wrong password') };
    }
    return { profile, error: null };
  }

  /** @return boolean, error */
  changeUserInfo(user) {
    const profile = this.db.getAccount(user.login);
    if (!profile) {
      return { ok: false, error: new Error('Account Not Found') };
    }
    if (user.password !== profile.password) {
      return { ok: false, error: new Error('Wrong password') };
    }
    const result = this.db.updateAccount(user);

    return { ok: result, error: null };
  }

  /** @return boolean, error */
  setUser(user) {
    const profile = this.db.getAccount(user.login);
    if (profile) {
      return {
        ok: false,
        error: new Error(`Account with login ${user.login} already exists`)
      };
    }
    const ok = this.db.setAccount(user);
    return { ok, error: null };
  }

  setBank(user, bank) {
    const profile = this.db.getAccount(user.login);
    if (!profile) {
      return { ok: false, error: new Error('Account Not Found') };
    }
    if (user.password !== profile.password) {
      return { ok: false, error: new Error('Wrong password') };
    }
    const ok = this.db.setBank(profile.account_id, bank);
    return { ok, error: null };
  }

  /** @return Array<Card>, error */
  getCards(user) {
    const profile = this.db.getAccount(user.login);
    if (!profile) {
      return { cards: null, error: new Error('Account Not Found') };
    }
    if (user.password !== profile.password) {
      return { cards: null, error: new Error('Wrong password') };
    }
    return { cards: this.db.getCards(profile.account_id), error: null };
  }

  /** @return boolean, error */
  async setCard(user) {
    try {
      const profile = this.db.getAccount(user.login);
      if (!profile) {
        return { ok: false, error: new Error('Account Not Found') };
      }
      if (!profile.token) {
        return { ok: false, error: new Error('Account Has No Token') };
      }
      if (user.password !== profile.password) {
        return { ok: false, error: new Error('Wrong password') };
      }
      const bank = this.db.getMonobank(profile);
      if (!bank) {
        return { ok: false, error: new Error('No cards present') };
      }
      const monoCards = await this.monoDS.getAccounts(bank.token);
      const monoAccounts = monoCards.accounts;
      const ok = this.db.setMonoCards(monoAccounts, profile);
      return { ok, error: null };
    } catch (error) {
      return { ok: false, error };
    }
  }

  /** @return boolean, error */
  deleteCard(card) {
    const exists = this.db.checkCard(card.card_id);
    if (!exists) {
      return { ok: false, error: new Error('Card Not Found') };
    }
    const ok = this.db.deleteCard(card.card_id);
    return { ok, error: null };
  }

  /** @return Array<Transaction>, error */
  async getTransactions(user) {
    try {
      const profile = this.db.getAccount(user.login);
      if (!profile) {
        throw new Error('Account Not Found');
      }
      if (!profile.token) {
        return { transactions: null, error: new Error('Account Has No Token') };
      }
      if (user.password !== profile.password) {
        throw new Error('Wrong password');
      }
      const bank = this.db.getMonobank(profile);
      if (!bank) {
        throw new Error('No cards present');
      }
      const cards = this.db.getCards(profile.account_id);
      const accounts = this._formMonoTrRequest(cards);
      const monoTransactions = this
        .monoDS
        .getTransactions(bank.token, accounts);
      const transactions = this.db.getTransactions(cards);
      // TODO: move to mono datasource
      const newTransactions = [];
      for (const [acc, trs] of Object.entries(monoTransactions)) {
        const newTrs = await trs;
        newTrs.forEach(tr => tr.bankCardId = acc);
        newTransactions.push(...newTrs);
      }
      this.db.setMonoTransactions(newTransactions);
      return {
        transactions: transactions.concat(newTransactions),
        error: null
      };
    } catch (error) {
      return { transactions: null, error };
    }
  }

  _formMonoTrRequest(cards) {
    const accounts = [];
    cards.forEach(card => {
      const trs = this.db.getLastTransaction(card);
      if (!trs || new Date(trs.date) < lastMonth()) {
        accounts.push({
          account: card.id,
          from: lastMonth(),
        });
      } else {
        accounts.push({
          account: card.id,
          from: trs.date,
        });
      }
    });
    return accounts;
  }

  /** @return Transaction */
  setTransaction(transaction) { // eslint-disable-line
    //TODO: not yet implemented
  }

  /** @return boolean */
  deleteTransaction(transaction) { // eslint-disable-line
    //TODO: not yet implemented
  }
}

module.exports = new LemonRepository();
