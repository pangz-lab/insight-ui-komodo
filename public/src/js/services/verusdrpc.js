'use strict';

angular.module('insight.verusdrpc')
  .factory('VerusdRPC', function ($http, $q) {
    function createPayload(method, params) {
      return {
        method: "POST",
        url: apiServer,
        data: {"jsonrpc": "1.0", "id":"curltest", "method": method, "params": params},
        headers: {
          'Content-Type': 'application/json',
          "Authorization": apiToken
        }
      }
    }

    function sendRequest(payload) {
      var deferred = $q.defer();
      
      $http(payload)
      .then(function successCallback(response) {
        deferred.resolve(response.data);
      }, function errorCallback(response) {
        deferred.reject({ status: response.status, data: response.data });
      });
      
      return deferred.promise;
    };

    function getRawTransaction(txId) {
      return sendRequest(createPayload("getrawtransaction", [txId, 1]));
    };
    
    function getBlockCount() {
      return sendRequest(createPayload("getblockcount", []));
    };
    
    function getIdentity(params) {
      return sendRequest(createPayload("getidentity", params));
    };
    
    function getAddressTxIds(addresses) {
      return sendRequest(createPayload("getaddresstxids", [{"addresses": addresses}]));
    };
    function getAddressBalance(addresses) {
      return sendRequest(createPayload("getaddressbalance", [{"addresses": addresses}]));
    };

    return {
      getRawTransaction: function(txId) {
        return getRawTransaction(txId);
      },
      getBlockCount: function() {
        return getBlockCount();
      },
      getIdentity: function(params) {
        return getIdentity(params);
      },
      getAddressTxIds: function(addresses) {
        return getAddressTxIds(addresses);
      },
      getAddressBalance: function(addresses) {
        return getAddressBalance(addresses);
      },
    };
});