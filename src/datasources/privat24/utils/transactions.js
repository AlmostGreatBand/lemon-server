'use strict';

const fs = require('fs');
const xmlJs = require('xml-js');
const transactionsXML = fs.readFileSync('./xml_data/transactions.xml', 'utf-8');

const fillTransactionsXml = dataForTransactions => {
  const xmlObj = xmlJs.xml2js(transactionsXML, { compact: true });

  const xmlMerchant = xmlObj.request.merchant;
  xmlMerchant.id._text = dataForTransactions.merchantId;

  const xmlData = xmlObj.request.data;
  xmlData.wait._text = dataForTransactions.wait;
  xmlData.test._text = dataForTransactions.test;

  const xmlPayment = xmlData.payment;
  xmlPayment._attributes.id = dataForTransactions.paymentId;

  const [xmlStartDate, xmlEndDate, xmlCardNumber] = xmlPayment.prop;
  xmlStartDate._attributes.value = dataForTransactions.startDate;
  xmlEndDate._attributes.value = dataForTransactions.endDate;
  xmlCardNumber._attributes.value = dataForTransactions.cardNumber;

  const xmlWithData = xmlJs.js2xml(xmlObj,
    { spaces: 0, compact: true, fullTagEmptyElement: true });
  return xmlWithData;
};

module.exports = { fillTransactionsXml };
