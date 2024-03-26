'use strict';

var TRANSACTION_DISPLAYED = 10;
var BLOCKS_DISPLAYED = 5;

angular
.module('insight.system')
.controller('IndexController',
    function (
        $scope,
        Global,
        // getSocket,
        // Blocks
        VerusWssClient,
        LocalStore
    ) {
        $scope.global = Global;
        var collectedBlocks = [];
        var collectedTxs = [];
        const MAX_BLOCKS_COUNT = 10;
        const MAX_TX_COUNT = 10;

        const CACHE_KEY_BLOCKS = 'vexp_blocks_received';
        const CACHE_KEY_TXS = 'vexp_txs_received';
        const CACHE_TTL_IN_SEC = 86400;// 24 hours
        const saveToCache = function(data, key) {
            LocalStore.set(key, data, CACHE_TTL_IN_SEC);
        }

        const wsTopic = VerusWssClient.getMessageTopic();
        $scope.$on(wsTopic, function(_, rawEventData) {
            console.log("Getting message from main listener [INDEXCTRL]...", rawEventData)
            if(rawEventData.latestBlocks.error || rawEventData.rawtx.error) { return; }
            
            setTimeout(function() {
                if(rawEventData.latestBlocks.data.blocks[0] !== undefined) {
                    updateBlocksScopeData(rawEventData.latestBlocks.data.blocks, false);
                }

                if(rawEventData.rawtx.data !== undefined) {
                    updateTxHashScopeData(rawEventData.rawtx.data, false);
                }
                $scope.$apply();
            }, 500);
        });

        function updateBlocksScopeData(data, isCachedData) {
            var currentSize = collectedBlocks.length;
            for(var i = 0; i < data.length; i++) {
                const d = data[i];
                if(collectedBlocks.includes(d.height)) { continue; }
                collectedBlocks.push(d.height);
                $scope.blocks.unshift({
                    height: d.height,
                    hash: d.hash,
                    txlength: !isCachedData? d.txs.length: d.txlength,
                    time: new Date(d.time),
                });
                currentSize += 1;
                if($scope.blocks[MAX_BLOCKS_COUNT] != undefined) {
                    $scope.blocks.pop();
                }
            }
            saveToCache($scope.blocks, CACHE_KEY_BLOCKS);
        }
        
        function updateTxHashScopeData(data, isCachedData) {
            if(collectedTxs.includes(data.txid)) { return; }
            collectedTxs.push(data.txid);
            const txid = data.txid;
            var totalVout = 0;
            var index = 0;

            if(isCachedData) {
                totalVout = data.valueOut;
                index = data.index;
            } else {
                index = collectedTxs.length;
                for(var i = 0; i < data.vout.length; i++) {
                    totalVout += data.vout[i].value;
                }
            }
            
            $scope.txs.unshift({
                txid: txid,
                valueOut: totalVout,
                index: index,
            });
            if($scope.txs[MAX_TX_COUNT] != undefined) {
                $scope.txs.pop();
            }
            saveToCache($scope.txs, CACHE_KEY_TXS);
        }

        $scope.loadData = function () {
            var cache = LocalStore.get(CACHE_KEY_BLOCKS);
            if(cache != undefined) {
                updateBlocksScopeData(cache, true)
            }

            cache = LocalStore.get(CACHE_KEY_TXS);
            if(cache != undefined) {
                cache.map(function(e) {
                    updateTxHashScopeData(e, true);
                })
            }
        };

        // var _getBlocks = function () {
        //     Blocks.get({
        //         limit: BLOCKS_DISPLAYED
        //     }, function (res) {
        //         $scope.blocks = res.blocks;
        //         $scope.blocksLength = res.length;
        //     });
        // };

        // var socket = getSocket($scope);

        // var _startSocket = function () {
        //     socket.emit('subscribe', 'inv');
        //     socket.on('tx', function (tx) {
        //         $scope.txs.unshift(tx);
        //         if (parseInt($scope.txs.length, 10) >= parseInt(TRANSACTION_DISPLAYED, 10)) {
        //             $scope.txs = $scope.txs.splice(0, TRANSACTION_DISPLAYED);
        //         }
        //     });

        //     socket.on('block', function () {
        //         _getBlocks();
        //     });
        // };

        // socket.on('connect', function () {
        //     _startSocket();
        // });



        // Put in a separate service
        $scope.humanSince = function (time) {
            var m = moment.unix(time);
            return moment.min(m).fromNow();
        };

        $scope.txs = [];
        $scope.blocks = [];
});
