'use strict';

/** @class User
 *
 * @property {string} name - User's name
 * @property {string} login - User's login (may be empty)
 * @property {string} password - User's password (may be empty) */
class User {
  constructor(name, login, password) {
    /** @field */
    this.name = name;
    this.login = login;
    this.password = password;
  }
}
