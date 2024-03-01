'use strict';

angular.module('insight.transactions').controller('transactionsController',
function($scope, $rootScope, $routeParams, $location, Global, VerusdRPC) {
  $scope.global = Global;
  $scope.loading = true;
  $scope.loadedBy = null;
  $scope.addressTxCount = 0;

  // var pageNum = 0;
  // var pagesTotal = 1;
  var txVoutTotalValue = 0;
  var txVinTotalValue = 0;
  // var startIndexLabel = 0;
  // var addressCommitments = {};
  // var COIN = 100000000;
  const COIN = 1e8;
  // const MVRSC_CURRENCY_FACTOR = 1000;

  // const convertValueToCurrencyFactor = function(value) {
  //   return parseFloat((value * MVRSC_CURRENCY_FACTOR).toFixed(5));
  // }

  var _aggregateItems = function(items, callback) {
    if (!items) return [];

    var l = items.length;

    // var ret = [];
    // var tmp = {};
    // var u = 0;

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

    // angular.forEach(tmp, function(v) {
    //   v.value    = v.value || parseInt(v.valueSat) / COIN;
    //   ret.push(v);
    // });
    // return ret;
  };

  var _processTX = function(tx, currentBlockHeight) {
    console.log("VIN >>");
    txVinTotalValue = 0;
    txVoutTotalValue = 0;
    addressCommitments = {};
    const hasVin = tx.vin != undefined && tx.vin[0] != undefined;
    // const hasVout = tx.vout != undefined && tx.vout[0] != undefined;
    ///////////////////////////////////
    // vin operation
    ///////////////////////////////////
    _aggregateItems(tx.vin == undefined ? [] : tx.vin, function(items, i) {
      items[i].uiWalletAddress = ( typeof(items[i].addresses) === "object" )
        ? items[i].addresses[0] 
        // Older TXs
        : items[i].address;

      txVinTotalValue += items[i].value;
    });

    ///////////////////////////////////
    // vout operation
    ///////////////////////////////////
    _aggregateItems(tx.vout, function(items, i) {
      // console.log(typeof(items[i].scriptPubKey.addresses));
      const addressType = typeof(items[i].scriptPubKey.addresses);
      const pubKeyAddressess = items[i].scriptPubKey.addresses ? items[i].scriptPubKey.addresses : [];
      var isIdentityTx = false;
      var identityPrimaryName = "";
      var uiWalletAddress = "";
      
      if(addressType === "object" && items[i].scriptPubKey.identityprimary) {
        // VerusID transaction
        // Get the first primary address
        isIdentityTx = true;
        uiWalletAddress = items[i].scriptPubKey.identityprimary.primaryaddresses[0];
        identityPrimaryName = items[i].scriptPubKey.identityprimary.name +'@';

      } else if(addressType === "object" ) {
        // Array of addresses - get the first one
        uiWalletAddress = pubKeyAddressess[0];
      } else {
        uiWalletAddress = pubKeyAddressess.join(",");
      }
      
      
      tx.vout[i].uiWalletAddress = uiWalletAddress[0] == undefined ? ' [ NO ADDRESS ] ' : uiWalletAddress;
      tx.vout[i].isSpent = items[i].spentTxId;
      tx.vout[i].multipleAddress = pubKeyAddressess.join(',');
      tx.vout[i].identityTxTypeLabel = "TODO";
      tx.vout[i].othercommitment = _getOtherTxCommitment(items[i].scriptPubKey);
      tx.vout[i].pbaasCurrencies = _getPbaasCommitment(items[i].scriptPubKey);
      tx.vout[i].isPbaasCurrencyExist = tx.vout[i].pbaasCurrencies[0] != undefined;

      txVoutTotalValue += items[i].value;
      
      if(isIdentityTx) {
        VerusdRPC.getIdentity([identityPrimaryName, tx.height])
        .then(function(data) {
          tx.vout[i].identityTxTypeLabel = (data.result) ? "Verus - ID mutation" : "Identity Commitment";
        });
      }
    });


    // New properties calculated manually
    tx.confirmations = tx.height? currentBlockHeight - tx.height + 1 : 0;
    tx.size = tx.hex.length / 2;
    tx.valueOut = txVoutTotalValue.toFixed(8);
    tx.isNewlyCreatedCoin = hasVin && tx.vin[0].coinbase != undefined;
    // tx.shieldedSpend = tx.vShieldedSpend != undefined ? tx.vShieldedSpend : [];
    // tx.shieldedOutput = tx.vShieldedOutput != undefined ? tx.vShieldedOutput : [];
    tx.shieldedSpend = [];
    tx.shieldedOutput = [];
    
    if (tx.overwintered && tx.version >= 4) {
      tx.shieldedSpend = tx.vShieldedSpend;
      tx.shieldedOutput = tx.vShieldedOutput;
    }
    
    tx.fees = parseFloat((txVinTotalValue - txVoutTotalValue).toFixed(8));
    if(tx.valueBalance != undefined) {
      if(tx.vout[0] == undefined) {
        tx.fees = parseFloat((tx.valueBalance + txVinTotalValue).toFixed(8));
      } else if(tx.vin[0] == undefined) {
        tx.fees = parseFloat((tx.valueBalance + txVoutTotalValue).toFixed(8));
      } else {
        tx.fees = parseFloat(((txVinTotalValue - txVoutTotalValue) + tx.valueBalance).toFixed(8));
      }
    }

    // TODO
    // 2. Update full view for transaction
    // 3. fix sequence or just remove the tx counter? http://localhost:2222/address/iLAZzpXuQpapbysYzLNUDLbpLuGr6NwhbH
  };

  var _getPbaasCommitment = function(scriptPubKey) {
    if(scriptPubKey.reserve_balance == undefined) {
      return [];
    }
    var pbaasBalances = [];
    const currencies = Object.entries(scriptPubKey.reserve_balance);
    for(var i = 0; i < currencies.length; i++) {
      const currency = currencies[i];
      pbaasBalances.push(currency[1] + ' ' + currency[0]);
    }
    return pbaasBalances;
  }

  var _getOtherTxCommitment = function(scriptPubKey) {
    if(scriptPubKey.crosschainimport) return 'crosschainimport';
    
    // Not seen the usage yet but exist in the API
    if(scriptPubKey.crosschainexport) return 'crosschainexport';
    if(scriptPubKey.identitycommitment) return scriptPubKey.identitycommitment;
    if(scriptPubKey.reservetransfer) return 'reservetransfer';
    if(scriptPubKey.pbaasNotarization) return 'pbaasNotarization';
    return '';
  }







  //////////////////////////////////////////////////////////////////////////
  // Commong method for transaction and address page
  //////////////////////////////////////////////////////////////////////////
  var _findTx = function(txid) {
    // TODO - improve this.
    // reduce getBlockCount call, add cooldown time based on the last request
    // localstorage can be used
    VerusdRPC.getBlockCount()
    .then(function(blockData) {
      VerusdRPC.getRawTransaction(txid)
      .then(function(data) {
        

        // var data.result = transformTransaction(data.result, blockData.result);
        // console.log(txid);
        console.log(data);
        // $rootScope.titleDetail = tx.txid.substring(0,7) + '...';
        $rootScope.flashMessage = null;
        // _processTX(data.result, blockData.result);
        _processTX(data.result, blockData.result);
        $scope.tx = data.result;
        // Used for address page only(not for transaction page)
        data.result.timing = new Date(data.result.time).getTime();
        // data.result.txCounter = startIndexLabel -= 1
        $scope.txs.push(data.result);
        // $scope.txs.push({tx: data.result, txCounter: (startIndexLabel -= 1) });
        // $scope.txIndexLabel[data.result.time] = (startIndexLabel -= 1);
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







  //////////////////////////////////////////////////////////////////////////
  // Address page helper methods
  //////////////////////////////////////////////////////////////////////////
  const MAX_ITEM_PER_SCROLL = 5;
  // const START_TX_INDEX_OFFSET = 2;
  $scope.isGettingAllTx = true;
  // One item is preloaded after getting all the txs so index 0 is already occupied
  $scope.startTransactionIndex = null;
  $scope.preProcessedTxIds = [];
  $rootScope.addressPage = {
    transactionCount: 0
  }

  var _getAllAddressTxs = function() {
    $scope.isGettingAllTx = true;
    $scope.hasTxFound = false;

    VerusdRPC.getAddressTxIds([$routeParams.addrStr])
    .then(function(data) {
      $scope.preProcessedTxIds = data.result;
      $scope.addressTxCount = data.result.length;
      $scope.hasTxFound = data.result[0];
      // Decremented in _findTx method
      // startIndexLabel = $scope.preProcessedTxIds.length + 1;

      $scope.startTransactionIndex = data.result.length - 1;
      _paginate(_getLastNElements($scope.preProcessedTxIds, $scope.startTransactionIndex, MAX_ITEM_PER_SCROLL));
      

      $rootScope.addressPage = { transactionCount: $scope.preProcessedTxIds.length };
      $scope.isGettingAllTx = false;
    });
  }
  
  var _getAllBlockTxs = function(hashes) {
    $scope.isGettingAllTx = true;
    $scope.hasTxFound = false;
    $scope.blockTxCount = hashes.length;
    // $scope.hasTxFound = false;

    // VerusdRPC.getAddressTxIds([$routeParams.addrStr])
    // .then(function(data) {
    //   $scope.preProcessedTxIds = data.result;
    //   $scope.hasTxFound = data.result[0];
    //   // Decremented in _findTx method
    //   startIndexLabel = $scope.preProcessedTxIds.length + 1;

    //   $scope.startTransactionIndex = data.result.length - 1;
    //   _paginate(_getLastNElements($scope.preProcessedTxIds, $scope.startTransactionIndex, MAX_ITEM_PER_SCROLL));
      

    //   $rootScope.addressPage = { transactionCount: $scope.preProcessedTxIds.length };
    //   $scope.isGettingAllTx = false;
    // });
    // console.log("hashes >>>");
    // console.log(hashes);

    // startIndexLabel = $scope.preProcessedTxIds.length + 1;
    $scope.preProcessedTxIds = hashes;
    $scope.startTransactionIndex = hashes.length - 1;
    _paginate(_getLastNElements($scope.preProcessedTxIds, $scope.startTransactionIndex, MAX_ITEM_PER_SCROLL));
    $scope.isGettingAllTx = false;
    $scope.hasTxFound = hashes[0];
  }

  // TODO, put in a service
  var _getLastNElements = function(a, start, count) {
    var x = 0;
    var result = [];
    for(var i = start; i >= 0; i--) {
      if(x == count) { break; }
      result.push(a[i]);
      x += 1;
    }
    // console.log(result);
    return result;
  }

  // var _byBlock = function() {
  //   TransactionsByBlock.get({
  //     block: $routeParams.blockHash,
  //     pageNum: pageNum
  //   }, function(data) {
  //     _paginate(data);
  //   });
  // };

  // TransactionsByAddress.get({
    //   address: $routeParams.addrStr,
    //   pageNum: pageNum
    // }, function(data) {
    //   _paginate(data);
    // });

  var _byBlock = function () {
    $scope.startTransactionIndex = $scope.startTransactionIndex - MAX_ITEM_PER_SCROLL;
    _paginate(
      _getLastNElements(
        $scope.preProcessedTxIds,
        $scope.startTransactionIndex,
        MAX_ITEM_PER_SCROLL
      )
    );
    
    $scope.loading = false;
  };
  
  var _byAddress = function () {
    $scope.startTransactionIndex = $scope.startTransactionIndex - MAX_ITEM_PER_SCROLL;
    _paginate(
      _getLastNElements(
        $scope.preProcessedTxIds,
        $scope.startTransactionIndex,
        MAX_ITEM_PER_SCROLL
      )
    );
    
    $scope.loading = false;
  };


  var _paginate = function(data) {
    pagesTotal = data.length;
    // pageNum += 1;

    // data.txs.forEach(function(tx) {
    //startIndexLabel = txStart
    // console.log(data);
    data.forEach(function(tx) {
      
      // startIndexLabel -= 1;  
      _findTx(tx);
      // const lastTx = $scope.tx;
      // $scope.txs.push(lastTx);
      // $scope.txIndexLabel[lastTx.time] = (startIndexLabel -= 1);
      // $scope.txs.push(tx);
    });    
  };

  

  // function transformTransaction(tx, currentBlockHeight) {
  //   // tx.fees = 1.1; // TODO
  //   // tx.fees = transactionDetail.voutTotalValue - transactionDetail.vinTotalValue;
  //   // tx.valueOut = 0.1; // TOD
  //   // tx.confirmations = currentBlockHeight - tx.height + 1;
  //   // f73abc67dbbbae282206f2129d74e85fcc7f93d9f53c9333385294632d81d4bb
  //   // tx.size = tx.hex.length / 2;
  //   // tx.isCoinBase = tx.coinbase;
  //   var transformed = structuredClone(tx);
  //   return transformed;
  // }

  $scope.findThis = function() {
    _findTx($routeParams.txId);
  };

  //Initial load
  $scope.load = function(from, hashes) {
    $scope.loadedBy = from;
    // if($scope.preProcessedTxIds[0] == undefined) {
    if($scope.loadedBy === 'address') {
      _getAllAddressTxs();
    } else {
      // console.log("hashes >>>");
      // console.log(hashes);
      _getAllBlockTxs(hashes);
      // _paginate(_getLastNElements($scope.preProcessedTxIds, $scope.startTransactionIndex, MAX_ITEM_PER_SCROLL));
    }
    // }
    $scope.loadMore();
  };

  //Load more transactions for pagination
  $scope.loadMore = function() {
    // if (pageNum < pagesTotal && !$scope.loading) {

    if ($scope.loadedBy === 'address') {
      _byAddress();
      // $scope.loading = false;
    } else {
      _byBlock();
    }
    // }
  };

  // Highlighted txout
  
  if ($routeParams.v_type == '>' || $routeParams.v_type == '<') {
    $scope.from_vin = $routeParams.v_type == '<' ? true : false;
    $scope.from_vout = $routeParams.v_type == '>' ? true : false;
    $scope.v_index = parseInt($routeParams.v_index);
    // console.log("v_index >>> ");
    // console.log($scope.from_vin);
    // console.log($scope.v_index);
    
    $scope.itemsExpanded = true;
  }
  
  //Init without txs
  $scope.txs = [];
  // If there's a memory issue, this can be removed.
  // This only serves as the index counter in each tx card
  $scope.txIndexLabel= {};

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
