'use strict';

angular.module('insight.blocks').controller('BlocksController',
  // function($scope, $rootScope, $routeParams, $location, Global, BlockByHeight, VerusdRPC, ScrollService, BlockService) {
  function($scope, $rootScope, $routeParams, $location, Global, VerusdRPC, ScrollService, BlockService) {
  $scope.global = Global;
  $scope.loading = false;
  $scope.currentDateTxList = [];
  $scope.lastStartIndex = 0;
  $scope.remainingTxCount = 0;
  $scope.pagination = {};
  const MAX_HASH_PER_LOAD = 50;
  // $scope.allTxs 

  // TODO, put in rootscope
  $scope.scrollToTop = function() {
    ScrollService.scrollToTop();
  };

  if ($routeParams.blockHeight) {
    // Will receive the redirect from status page when the "Blocks" value is clicked
    _handleRedirectFromStatusPage($routeParams.blockHeight);
  }

  var _handleRedirectFromStatusPage = function(blockHeight) {
    VerusdRPC.getBlockDetailByHeight(blockHeight)
    .then(function(data) {
      $location.path('block/' + data.result.hash);
    })
    .catch(function(_) {
      $rootScope.flashMessage = 'Bad Request';
      $location.path('/');
    });
  }

  //Datepicker
  var _setCalendarDate = function(date) {
    $scope.dt = date;
  };

  var _createDatePaginationDisplay = function(date) {
    $scope.pagination = {};
    const d = new Date(date);
    var current = _formatTimestamp(d);
    var prev = new Date(d);
    var next = new Date(d);
    prev.setDate(prev.getDate() - 1);
    next.setDate(next.getDate() + 1);

    $scope.pagination = {
      current: current,
      prev: _formatTimestamp(prev),
      next: _formatTimestamp(next),
      currentTs: parseInt(d.getTime().toString().substring(0, 10)),
      isToday: _formatTimestamp(new Date()) == current
    };
    
    console.log($scope.pagination);
  };

  var _formatTimestamp = function (date) {
    var yyyy = date.getUTCFullYear().toString();
    var mm = (date.getUTCMonth() + 1).toString(); // getMonth() is zero-based
    var dd  = date.getUTCDate().toString();

    return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]); //padding
  };

  $scope.$watch('dt', function(newValue, oldValue) {
    if (newValue !== oldValue) {
      $location.path('/blocks-date/' + _formatTimestamp(new Date(newValue)));
    }
  });

  $scope.openCalendar = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.humanSince = function(time) {
    var m = moment.unix(time).startOf('day');
    var b = moment().startOf('day');
    return moment.min(m).from(b);
  };

  // TODO, put in a service
  var _getLastNElements = function(array, start, count) {
    var x = 0;
    var result = [];
    for(var i = start; i >= 0; i--) {
      if(x == count) { break; }
      result.push(array[i]);
      x += 1;
    }
    // console.log(result);
    return result;
  }

  var _createBlockSummary = function(hashList, onEachTxSummary) {
    // var blockSummary = [];
    for(var i = hashList.length - 1; i >= 0; i--) {
      const currentHash = hashList[i];
      VerusdRPC.getBlockDetailByTx(currentHash)
      .then(function(data) {
        const result = data.result;
        // blockSummary.push({hash: result.hash, height: result.height, time: result.time, txCount: result.tx.length});
        const summary = {hash: result.hash, height: result.height, time: result.time, txCount: result.tx.length};
        onEachTxSummary(summary);
      });
    }
    // return blockSummary;
  };

  var _getDateRange = function(dateTime) {
    var dateEnd = new Date(dateTime);
    var dateStart = new Date(dateTime);
    dateStart.setHours(0, 0, 0, 0);
    dateEnd.setHours(24, 0, 0, 0);
    return {
      start: parseInt(dateStart.getTime().toString().slice(0, 10)),
      end: parseInt(dateEnd.getTime().toString().slice(0, 10)),
    }
  };


  $scope.list = function() {
    $scope.loading = true;

    if ($routeParams.blockDate) {
      $scope.detail = 'On ' + $routeParams.blockDate;
    }

    if ($routeParams.startTimestamp) {
      var d = new Date($routeParams.startTimestamp*1000);
      var m = d.getMinutes();
      if (m < 10) m = '0' + m;
      $scope.before = ' before ' + d.getHours() + ':' + m;
    }

    $rootScope.titleDetail = $scope.detail;
    
    console.log("BLock list >>");
    console.log($routeParams.startTimestamp);
    console.log($routeParams.blockDate);

    const blockDate = $routeParams.blockDate == undefined ? 
      (new Date()).toString() : 
      (new Date($routeParams.blockDate)).toString()
    const range = _getDateRange(blockDate);
    // const range = _getDateRange((new Date()).toString());
    console.log(range);

    VerusdRPC.getBlockHashes(range.end, range.start)
    .then(function(data) {
      console.log(data);
      $scope.currentDateTxList = data.result;
      
      $scope.lastStartIndex = $scope.currentDateTxList.length - 1;
      $scope.loading = true;
      _createBlockSummary(_getLastNElements($scope.currentDateTxList, $scope.lastStartIndex, MAX_HASH_PER_LOAD), function(summary) {
        $scope.blocks.push(summary);
      });
      $scope.loading = false;
      _setCalendarDate(blockDate);
      _createDatePaginationDisplay(blockDate);
      // VerusdRPC.getBlockDetailByTx(currentTx)
      // .then(function(data) {
      //   const currentHeight = data.result.height;
      //   $scope.blocks = _createBlockSummary(currentHeight, hashList);
      //   $scope.loading = false;
      //   // $scope.blocks = res.blocks;
      //   // $scope.pagination = res.pagination;
      // })
    });
    

    // Blocks.get({
    //   blockDate: $routeParams.blockDate,
    //   startTimestamp: $routeParams.startTimestamp
    // }, function(res) {
    //   $scope.loading = false;
    //   $scope.blocks = res.blocks;
    //   $scope.pagination = res.pagination;
    // });
  };

  $scope.loadMorelist = function() {
    $scope.remainingTxCount = $scope.lastStartIndex + 1;
    if($scope.lastStartIndex < 0) { return; }
    console.log("added more to list >>");
    $scope.lastStartIndex = $scope.lastStartIndex - MAX_HASH_PER_LOAD;
    
    $scope.loading = true;
    _createBlockSummary(_getLastNElements($scope.currentDateTxList, $scope.lastStartIndex, MAX_HASH_PER_LOAD), function(summary) {
      $scope.blocks.push(summary);
    });
    // console.log($scope.lastStartIndex);
    // console.log(newList);
    // var lastList = $scope.blocks;
    // $scope.blocks = lastList.concat(newList);
    $scope.loading = false;
  };

  $scope.findOne = function() {
    $scope.loading = true;

    console.log("TX ID");
    console.log($routeParams);
    console.log($routeParams.blockHash);
    console.log("TX ID end >>");
    // console.log($scope.params);
    // console.log($routeParams.txId);

    // VerusdRPC.getBlockDetailByTx(currentHash)
    // .then(function(data) {
    //   const result = data.result;
    //   // blockSummary.push({hash: result.hash, height: result.height, time: result.time, txCount: result.tx.length});
    //   const summary = {hash: result.hash, height: result.height, time: result.time, txCount: result.tx.length};
    //   onEachTxSummary(summary);
    // });

    VerusdRPC.getBlockDetailByTx($routeParams.blockHash)
    // VerusdRPC.getBlockDetail(2935546)
    .then(function(data) {
      data.result.reward = BlockService.getBlockReward(data.result.height);
      data.result.isMainChain = (data.result.confirmations !== -1);

      const block = data.result;
      console.log("block >>>");
      console.log(data);
      console.log($routeParams.blockHeight);
      console.log(block);

      $rootScope.titleDetail = block.height;
      $rootScope.flashMessage = null;
      $scope.loading = false;
      $scope.block = block;
    })
    .catch(function(e) {
      if (e.status === 400) {
        $rootScope.flashMessage = 'Invalid Transaction ID: ' + $routeParams.txId;
      }
      else if (e.status === 503) {
        $rootScope.flashMessage = 'Backend Error. ' + e.data;
      }
      else {
        $rootScope.flashMessage = 'Block Not Found';
      }
      $location.path('/');
    });
    $scope.loading = false;
  };
  // $scope.findOne = function() {
  //   $scope.loading = true;

  //   Block.get({
  //     blockHash: $routeParams.blockHash
  //   }, function(block) {
  //     $rootScope.titleDetail = block.height;
  //     $rootScope.flashMessage = null;
  //     $scope.loading = false;
  //     $scope.block = block;
  //   }, function(e) {
  //     if (e.status === 400) {
  //       $rootScope.flashMessage = 'Invalid Transaction ID: ' + $routeParams.txId;
  //     }
  //     else if (e.status === 503) {
  //       $rootScope.flashMessage = 'Backend Error. ' + e.data;
  //     }
  //     else {
  //       $rootScope.flashMessage = 'Block Not Found';
  //     }
  //     $location.path('/');
  //   });
  // };

  $scope.blocks = [];
  $scope.params = $routeParams;
});
