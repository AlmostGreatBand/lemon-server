'use strict';

const asincify = fn => (...args) => new Promise(
  (resolve, reject) => fn(...args, 
    (err, data) => err === null ? resolve(data) : reject(err))
);

module.exports = asincify;