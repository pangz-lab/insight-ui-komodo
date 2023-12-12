'use strict';

angular.module('insight.transactions').controller('transactionsController',
function($scope, $rootScope, $routeParams, $location, Global, Transaction, TransactionsByBlock, TransactionsByAddress, VerusdRPC) {
  $scope.global = Global;
  $scope.loading = false;
  $scope.loadedBy = null;

  var pageNum = 0;
  var pagesTotal = 1;
  var COIN = 100000000;

  var _aggregateItems = function(items, callback) {
    if (!items) return [];

    var l = items.length;

    var ret = [];
    var tmp = {};
    var u = 0;

    for(var i=0; i < l; i++) {
      callback(items, i);
      // var notAddr = false;
      // // non standard input
      // if (items[i].scriptSig && !items[i].addresses) {
      //   // items[i].addr = 'Unparsed address 1 [' + u++ + ']';
      //   items[i].addr = 'OP_RETURN';
      //   items[i].notAddr = true;
      //   notAddr = true;
      // }
 
      // // non standard output
      // if (items[i].scriptPubKey && typeof(items[i].scriptPubKey.addresses) !== "object") {
      //   items[i].scriptPubKey.addresses = [ 'OP_RETURN' ];
      //   items[i].notAddr = true;
      //   notAddr = true;
      // }

      // // multiple addr at output
      // if (items[i].scriptPubKey 
      //   && typeof items[i].scriptPubKey.addresses === "object" 
      //   &&  items[i].scriptPubKey.addresses.length > 1) {

      //   items[i].addr = items[i].scriptPubKey.addresses.join(',');
      //   ret.push(items[i]);
      //   continue;
      // }

      // // multiple addr at output
      // if (items[i].scriptPubKey 
      //   && typeof items[i].scriptPubKey.addresses === "object" 
      //   &&  items[i].scriptPubKey.addresses.length == 1) {

      //   items[i].addr = items[i].scriptPubKey.addresses[0];
      //   ret.push(items[i]);
      //   continue;
      // }
      
      // if (items[i].scriptPubKey && items[i].scriptPubKey.addresses) {
      //   items[i].addr = "OP_RETURN"
      //   ret.push(items[i]);
      //   continue;
      // }
      
      // var addr = (items[i].addresses && items[i].addresses[0]) 
      // || (items[i].scriptPubKey && items[i].scriptPubKey.addresses[0]);

      // var addr = items[i].addr || (items[i].scriptPubKey && items[i].scriptPubKey.addresses[0]);

      // if(items[i].identityprimary)
      //     addr = items[i].identityprimary.primaryaddresses[0];

      // if (!tmp[addr]) {
      //   tmp[addr] = {};
      //   tmp[addr].valueSat = 0;
      //   tmp[addr].count = 0;
      //   tmp[addr].addr = addr;
      //   tmp[addr].items = [];
      // }
      // tmp[addr].isSpent = items[i].spentTxId;
       
      // tmp[addr].address_pbaas = items[i].addresses; 

      // tmp[addr].doubleSpentTxID = tmp[addr].doubleSpentTxID   || items[i].doubleSpentTxID;
      // tmp[addr].doubleSpentIndex = tmp[addr].doubleSpentIndex || items[i].doubleSpentIndex;
      // tmp[addr].dbError = tmp[addr].dbError || items[i].dbError;
      // tmp[addr].valueSat += Math.round(items[i].value * COIN);
      // tmp[addr].items.push(items[i]);
      // tmp[addr].notAddr = notAddr;
      // tmp[addr].script_reserve_balance = items[i].script_reserve_balance;
      // tmp[addr].identityprimary = items[i].identityprimary; //Identities
      // tmp[addr].currencydefinition = items[i].currencydefinition; //Currency definition
      
     
      // if(items[i].other_commitment){
      //   var other_commit = Object.keys(items[i].other_commitment)[0];
      //   tmp[addr].othercommitment = other_commit;
      // }

      // if(items[i].script_reserve_balance){
      // var currency = Object.keys(items[i].script_reserve_balance);
      // var currency_value = Object.values(items[i].script_reserve_balance);
      //   tmp[addr].pbaas = ' ' + currency_value + ' ' + currency[0]; 
      // }
      // if (items[i].unconfirmedInput)
      //   tmp[addr].unconfirmedInput = true;

      // tmp[addr].count++;
    }

    angular.forEach(tmp, function(v) {
      v.value    = v.value || parseInt(v.valueSat) / COIN;
      ret.push(v);
    });
    return ret;
  };

  var _processTX = function(tx) {
    console.log("VIN >>");
    tx.vinSimple = _aggregateItems(tx.vin, function(items, i) {
      items[i].uiWalletAddress = ( typeof(items[i].addresses) === "object" )
        ? items[i].addresses[0] 
        : items[i].addresses;
    });
    console.log("VOUT >>");
    tx.voutSimple = _aggregateItems(tx.vout, function(items, i) {
      items[i].uiWalletAddress = ( typeof(items[i].scriptPubKey.addresses) === "object" )
        ? items[i].scriptPubKey.addresses.join(",")
        : items[i].scriptPubKey;
    });
  };

  var _paginate = function(data) {
    $scope.loading = false;

    pagesTotal = data.pagesTotal;
    pageNum += 1;

    data.txs.forEach(function(tx) {
      _processTX(tx);
      $scope.txs.push(tx);
    });
  };

  var _byBlock = function() {
    TransactionsByBlock.get({
      block: $routeParams.blockHash,
      pageNum: pageNum
    }, function(data) {
      _paginate(data);
    });
  };

  var _byAddress = function () {
    TransactionsByAddress.get({
      address: $routeParams.addrStr,
      pageNum: pageNum
    }, function(data) {
      _paginate(data);
    });
  };

  var _findTx = function(txid) {
    VerusdRPC.getBlockCount()
    .then(function(blockData) {
      VerusdRPC.getRawTransaction(txid)
      .then(function(data) {

        var tx = transformTransaction(data.result, blockData.result);
        console.log(tx);
        $rootScope.titleDetail = tx.txid.substring(0,7) + '...';
        $rootScope.flashMessage = null;
        $scope.tx = tx;
        _processTX(tx);
        $scope.txs.unshift(tx);
      })
      .catch(function(e) {
        if (e.status === 400) {
          $rootScope.flashMessage = 'Invalid Transaction ID: ' + $routeParams.txId;
        }
        else if (e.status === 503) {
          $rootScope.flashMessage = 'Backend Error. ' + e.data;
        }
        else {
          $rootScope.flashMessage = 'Transaction Not Found';
        }

        $location.path('/');
      });
        
    });
  };

  function transformTransaction(tx, currentBlockHeight) {
    tx.fees = 1.1; // TODO
    tx.valueOut = 0.1; // TOD
    tx.confirmations = currentBlockHeight - tx.height + 1;
    tx.size = tx.hex.length / 2;
    tx.isCoinBase = (tx.coinbase);
    var transformed = structuredClone(tx);
    return transformed;
  }

  $scope.findThis = function() {
    _findTx($routeParams.txId);
  };

  //Initial load
  $scope.load = function(from) {
    $scope.loadedBy = from;
    $scope.loadMore();
  };

  //Load more transactions for pagination
  $scope.loadMore = function() {
    if (pageNum < pagesTotal && !$scope.loading) {
      $scope.loading = true;

      if ($scope.loadedBy === 'address') {
        _byAddress();
      }
      else {
        _byBlock();
      }
    }
  };

  // Highlighted txout
  if ($routeParams.v_type == '>' || $routeParams.v_type == '<') {
    $scope.from_vin = $routeParams.v_type == '<' ? true : false;
    $scope.from_vout = $routeParams.v_type == '>' ? true : false;
    $scope.v_index = parseInt($routeParams.v_index);
    $scope.itemsExpanded = true;
  }
  
  //Init without txs
  $scope.txs = [];

  $scope.$on('tx', function(event, txid) {
    _findTx(txid);
  });

});

angular.module('insight.transactions').controller('SendRawTransactionController',
  function($scope, $http) {
  $scope.transaction = '';
  $scope.status = 'ready';  // ready|loading|sent|error
  $scope.txid = '';
  $scope.error = null;

  $scope.formValid = function() {
    return !!$scope.transaction;
  };
  $scope.send = function() {
    var postData = {
      rawtx: $scope.transaction
    };
    $scope.status = 'loading';
    $http.post(window.apiPrefix + '/tx/send', postData)
      .success(function(data, status, headers, config) {
        if(typeof(data.txid) != 'string') {
          // API returned 200 but the format is not known
          $scope.status = 'error';
          $scope.error = 'The transaction was sent but no transaction id was got back';
          return;
        }

        $scope.status = 'sent';
        $scope.txid = data.txid;
      })
      .error(function(data, status, headers, config) {
        $scope.status = 'error';
        if(data) {
          $scope.error = data;
        } else {
          $scope.error = "No error message given (connection error?)"
        }
      });
  };
});
