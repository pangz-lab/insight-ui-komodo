'use strict';

angular
.module('insight.status')
.controller('StatusController',
    function (
        $scope,
        Global,
        VerusExplorerApi,
        UnitConversionService
    ) {
        $scope.global = Global;
        const CACHE_KEY = 'vexplorer_status';
        const CACHE_TTL_IN_SEC = 30;

        $scope.shortenValue = function (v) {
            if (v == null) return '';
            return parseFloat(v).toFixed(2);
        };
        $scope.convertValue = function (v, unit) {
            if (v == null) return '';
            return UnitConversionService.convert(parseFloat(v), unit);
        };


        // var _setData = function() {
        //   return {
        //     group1: function(data) {
        //       $scope.info = data[0].result;
        //       $scope.mininginfo = data[1].result;
        //       $scope.coinSupply = data[2].result;
        //     },

        //     group2: function(data2) {
        //       $scope.info.blockHash = data2.result.hash;
        //     }
        //   };
        // };

        $scope.getBlockchainStatus = function () {
            $scope.loaded = false;
            VerusExplorerApi
                .getBlockchainStatus()
                .then(function (statusResult) {
                    const data = statusResult.data;
                    $scope.info = data.info;
                    $scope.mininginfo = data.mininginfo;
                    $scope.coinSupply = data.coinSupply;
                    $scope.info.blockHash = data.info.blocks;
                    $scope.loaded = true;
                });
            // var cache = JSON.parse(localStorage.getItem(CACHE_KEY));

            // if(cache != undefined 
            //   && Math.floor((new Date() - new Date(cache.createdAt)) / 1000) < CACHE_TTL_IN_SEC) {
            //   _setData().group1(cache.data);
            //   _setData().group2(cache.data[3]);
            //   $scope.loaded = 1;
            //   return;
            // }

            // var requests = [
            //   VerusdRPC.getInfo(),
            //   VerusdRPC.getMiningInfo(),
            //   VerusdRPC.getBlockchainStatus()
            // ];

            // Promise.all(requests)
            // .then(function(response) {
            //   console.log("RAW response >>");
            //   console.log(response);
            //   _setData().group1(response);
            //   const blocks = response[0].result.blocks;

            //   VerusdRPC.getBlockDetailByHeight(blocks)
            //   .then(function(response2) {
            //     _setData().group2(response2);
            //     response.push(response2);
            //     localStorage.setItem(CACHE_KEY, JSON.stringify({ data: response, createdAt: new Date()}));
            //     $scope.loaded = 1;
            //   });
            // });
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

        $scope.humanSince = function (time) {
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
