'use strict';

angular
.module('insight.status')
.controller('StatusController',
    function (
        $scope,
        Global,
        VerusExplorerApi,
        VerusWssClient,
        UnitConversionService,
        LocalStore
    ) {
        $scope.global = Global;
        const CACHE_KEY = 'vexp_stats';
        const CACHE_TTL_IN_SEC = 86400;// 24 hours
        const saveToCache = function(data) {
            LocalStore.set(CACHE_KEY, data, CACHE_TTL_IN_SEC);
        }

        const wsTopic = VerusWssClient.getMessageTopic();
        $scope.$on(wsTopic, function(event, rawEventData) {
        // $scope.$on('wsmessage', function(data) {
            // console.log("Getting message from main listener ...", rawEventData)
            if(
                rawEventData.status.data == undefined 
                || rawEventData.status.error
                || rawEventData.status.data.blocks <= $scope.info.blocks) {
                return;
            }
            
            setTimeout(function() {
                updateScopeData(rawEventData.status.data);
                $scope.$apply();
            }, 500);
        })

        // var wsChannel = VerusWssClient.getMessageTopic();
        // function wsOnMessageEH(event) {
        //     console.log('Message from server: >> THIS StatusController scope >>');
        //     const wsData = JSON.parse(event.data);
        //     updateScopeData(wsData.status.data);
        // }
        // function wsOnOpen(event) {
        //     console.log("Status OPEN Again 1...")
        //     console.log("Status reconnecting ...")
        //     // wsChannel.removeEventListener('message', wsOnMessageEH);
        //     wsChannel = VerusWssClient.getClient();
        // }

        // wsChannel.addEventListener('message', wsOnMessageEH);
        // wsChannel.addEventListener('open', wsOnOpen);
        // $scope.$on('$destroy', function () {
        //     wsChannel.removeEventListener('message', wsOnMessageEH);
        //     wsChannel.removeEventListener('open', wsOnOpen);
        // });



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

        const updateScopeData = function(data) {
            $scope.info = data;
            // {
            //     "VRSCversion": "1.2.1",
            //     "protocolVersion": 170009,
            //     "blocks": 2975765,
            //     "connections": 46,
            //     "difficulty": 3885301441879.934,
            //     "version": 2000753,
            //     "networkHashrate": 831732729899,
            //     "circulatingSupply": 75294572.76572011,
            //     "circulatingSupplyTotal": 75818787.51843677,
            //     "circulatingZSupply": 524214.75271666
            //   }

            // $scope.mininginfo = data.mininginfo;
            // $scope.coinSupply = data.coinSupply;
            // $scope.info.blockHash = data.info.blocks;
            saveToCache(data);
        }

        $scope.getBlockchainStatus = function () {
            const cache = LocalStore.get(CACHE_KEY);
            if(cache != undefined) {
                updateScopeData(cache);
                $scope.loaded = true;
                return;
            }
            VerusExplorerApi
                .getBlockchainStatus()
                .then(function (statusResult) {
                    updateScopeData(statusResult.data);
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


        $scope.getSync = function() {
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
        };
    });
