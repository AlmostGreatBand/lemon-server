'use strict';
const dbInterface = require('../testServer/dbInterface'); // temp db
const MonoDataSource = require('./mono/mono');

const lastMonth = () => {
  const date = new Date();
  return date.setMonth(date.getMonth() - 1);
};

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
    return { profile, error: null };
  }

  /** @return boolean, error */
  changeUserInfo(user) {
    const profile = this.db.getAccount(user.login);
    if (!profile) {
      return { ok: false, error: new Error('Account Not Found') };
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
        error: new Error(`Account with login ${profile.login} already exists`)
      };
    }
    const ok = this.db.setAccount();
    return { ok, error: null };
  }

  setBank(user, bank) {
    const profile = this.db.getAccount(user.login);
    if (!profile) {
      return { ok: false, error: new Error('Account Not Found') };
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

    return { cards: this.db.getCards(profile.account_id), error: null };
  }

  /** @return boolean, error */
  async setCard(user) {
    try {
      const profile = this.db.getAccount(user.login);
      if (!profile.token) {
        throw new Error('Account Not Found');
      }
      const bank = dbInterface.getMonobank(profile);
      if (!bank) {
        return { ok: false, error: new Error('No monobank cards present') };
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
      if (!profile.token) {
        throw new Error('Account Has No Token');
      }
      const bank = this.db.getMonobank(profile);
      const cards = this.db.getCards(profile.account_id);
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
      const monoTransactions = accounts ?
        this.monoDS.getTransactions(bank.token, [ { from: lastTrs.date } ]) :
        this.monoDS.getTransactions(bank.token, [ { account: '0' } ]);
      for (const [acc, trs] of Object.entries(monoTransactions)) {
        transactions.push(await trs);
      }
      this.db.setTransactions(monoTransactions);
      return {
        transactions: transactions.push(monoTransactions),
        error: null
      };
    } catch (error) {
      return { transactions: null, error };
    }
  }

  /** @return Transaction */
  setTransaction(transaction) {
    //TODO: not yet implemented
  }

  /** @return boolean */
  deleteTransaction(transaction) {
    //TODO: not yet implemented
  }
}

module.exports = new LemonRepository();
