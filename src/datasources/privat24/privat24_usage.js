'use strict';

const PrivatDataSource = require('./privat24.js');

// sample data for transactions request
const dataForTransactionsRequest = {
  merchantPassword: '55x3Ft9C96yx7s1cAMO2KVn1apuDA0X6',
  merchantId: 123456,
  wait: 10,
  test: 0,
  paymentId: '',
  startDate: '11.05.2020',
  endDate: '23.10.2020',
  cardNumber: '1234567890123456'
};

// sample data for balance request
const dataForBalanceRequest = {
  merchantPassword: '55x3Ft9C96yx7s1cAMO2KVn1apuDA0X6',
  merchantId: 123456,
  wait: 10,
  test: 0,
  paymentId: '',
  cardNumber: '1234567890123456',
  country: 'UA'
};

// example of using
(async () => {
  const pds = new PrivatDataSource();
  const tranData = await pds.getTransactionsData(dataForTransactionsRequest);
  const balanceData = await pds.getBalanceData([dataForBalanceRequest]);
  // dataForBalanceRequest is array of data objects
  console.log(tranData);
  console.log(balanceData);
})();
