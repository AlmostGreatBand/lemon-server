'use strict';

const lastMonth = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date;
};

const times = {
  second: 1000,
  minute: 1000 * 60,
  hour: 1000 * 60 * 60
};

module.exports = {
  lastMonth,
  times
};
