'use strict';

const fs = require('fs');
const xmlJs = require('xml-js');
const balanceXML = fs.readFileSync('./xml_data/balance.xml', 'utf-8');

const fillBalanceXml = dataForBalance => {
  const xmlObj = xmlJs.xml2js(balanceXML, { compact: true });

  const xmlMerchant = xmlObj.request.merchant;
  xmlMerchant.id._text = dataForBalance.merchantId;

  const xmlData = xmlObj.request.data;
  xmlData.wait._text = dataForBalance.wait;
  xmlData.test._text = dataForBalance.test;

  const xmlPayment = xmlData.payment;
  xmlPayment._attributes.id = dataForBalance.paymentId;

  const [xmlCardNumber, xmlCountry] = xmlPayment.prop;
  xmlCardNumber._attributes.value = dataForBalance.cardNumber;
  xmlCountry._attributes.value = dataForBalance.country;

  const xmlWithData = xmlJs.js2xml(xmlObj, {
    spaces: 0,
    compact: true,
    fullTagEmptyElement: true
  });
  return xmlWithData;
};

module.exports = { fillBalanceXml };
