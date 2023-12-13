'use strict';

var testnet = false;
var netSymbol = testnet ? 'VRSCTEST' : 'VRSC';
// const apiServer = testnet ? 'http://127.0.0.1:27486' : 'http://localhost:3001';
const apiServer = testnet ? 'http://127.0.0.1:27486' : 'https://api.verus.services';
// Need to secure the API token. Better put the API behind a gateway or a reverse proxy
const apiToken =  testnet ? '' : 'Basic dmVydXNkZXNrdG9wOnk4RDZZWGhBRms2alNoSGlSQktBZ1JDeDB0OVpkTWYyUzNLMG83ek44U28="';

var defaultLanguage = localStorage.getItem('insight-language') || 'en';
var defaultCurrency = localStorage.getItem('insight-currency') || netSymbol;

angular.module('insight',[
  'ngAnimate',
  'ngResource',
  'ngRoute',
  'ngProgress',
  'ui.bootstrap',
  'ui.route',
  'monospaced.qrcode',
  'gettext',
  'angularMoment',
  'insight.system',
  'insight.socket',
  'insight.blocks',
  'insight.transactions',
  'insight.address',
  'insight.search',
  'insight.charts',
  'insight.status',
  'insight.connection',
  'insight.currency',
  'insight.messages',
  'insight.verusdrpc'
]);

angular.module('insight.system', []);
angular.module('insight.socket', []);
angular.module('insight.blocks', []);
angular.module('insight.transactions', []);
angular.module('insight.address', []);
angular.module('insight.search', []);
angular.module('insight.charts', []);
angular.module('insight.status', []);
angular.module('insight.connection', []);
angular.module('insight.currency', []);
angular.module('insight.messages', []);
angular.module('insight.verusdrpc', []);
