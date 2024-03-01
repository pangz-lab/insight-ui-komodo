'use strict';

angular.module('insight.status').controller('StatusController',
  function($scope, Global, Status, Sync, getSocket, VerusdRPC) {
    $scope.global = Global;

    $scope.getBlockchainStatus = function() {
      VerusdRPC.getInfo()
      .then(function(data) {
        $scope.info = data.result;

        VerusdRPC.getBlockDetailByHeight(data.result.blocks)
        .then(function(data2) {
          $scope.info.blockHash = data2.result.hash;
        })
      });
      VerusdRPC.getMiningInfo()
      .then(function(data) {
        $scope.mininginfo = data.result;
      });
      VerusdRPC.getCoinSupply()
      .then(function(data) {
        $scope.coinSupply = data.result;
      });
    };

    // $scope.getStatus = function(q) {
    //   Status.get({
    //       q: 'get' + q
    //     },
    //     function(d) {
    //       $scope.loaded = 1;
    //       angular.extend($scope, d);
    //     },
    //     function(e) {
    //       $scope.error = 'API ERROR: ' + e.data;
    //     });
    // };

    $scope.humanSince = function(time) {
      var m = moment.unix(time / 1000);
      return moment.min(m).fromNow();
    };

    // var _onSyncUpdate = function(sync) {
    //   $scope.sync = sync;
    // };

    // var _startSocket = function () {
    //   socket.emit('subscribe', 'sync');
    //   socket.on('status', function(sync) {
    //     _onSyncUpdate(sync);
    //   });
    // };
    
    // var socket = getSocket($scope);
    // socket.on('connect', function() {
    //   _startSocket();
    // });


    // $scope.getSync = function() {
    //   _startSocket();
    //   Sync.get({},
    //     function(sync) {
    //       _onSyncUpdate(sync);
    //     },
    //     function(e) {
    //       var err = 'Could not get sync information' + e.toString();
    //       $scope.sync = {
    //         error: err
    //       };
    //     });
    // };
  });
