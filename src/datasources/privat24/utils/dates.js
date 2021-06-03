'use strict';

const stringToDate = date => {
  const [day, month, year] = date.split('.');
  return new Date(`${year}-${month}-${day}`);
};

const dateToString = date =>
  `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

const divideIntoPeriods = (startDate, endDate) => {
  const periods = [];
  const day = 1000 * 3600 * 24;
  const threeMonths = day * 30 * 3;
  const periodEnd = new Date(startDate.getTime() + threeMonths);
  periods.push([startDate, periodEnd]);

  while (periods[periods.length - 1][1] < endDate) {
    const lastPeriodEnd = periods[periods.length - 1][1];
    const newPeriodStart = new Date(lastPeriodEnd.getTime() + day);
    const newPeriodEnd = new Date(newPeriodStart.getTime() + threeMonths);
    periods.push([newPeriodStart, newPeriodEnd]);
  }
  periods[periods.length - 1][1] = endDate;

  return periods;
};

module.exports = { stringToDate, dateToString, divideIntoPeriods };
