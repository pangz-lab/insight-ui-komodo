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
        LocalStore,
        WsEventDataManager
    ) {
        $scope.global = Global;
        // var collectedBlocks = [];
        // var collectedTxs = [];
        // const MAX_BLOCKS_COUNT = 5;
        // const MAX_TX_COUNT = 30;

        const CACHE_KEY_BLOCKS = localStore.latestBlocks.key;
        // const CACHE_TTL_BLOCK = localStore.latestBlocks.ttl;
        
        const CACHE_KEY_TXS = localStore.latestBlockTxs.key;

        // const CACHE_KEY_STATUS = localStore.status.key;
        // // const CACHE_TTL_STATUS = localStore.status.ttl;// 24 hours
        // const CACHE_KEY_NODE_STATE = localStore.nodeState.key;
        // const CACHE_TTL_TXS = localStore.latestBlockTxs.ttl;

        // const saveToCache = function(data, key, ttl) {
        //     LocalStore.set(key, data, ttl);
        // }

        const wsTopic = VerusWssClient.getMessageTopic();
        $scope.$on(wsTopic, function(_, rawEventData) {
            console.log("Getting message from main listener [INDEXCTRL]...", rawEventData)
            if( rawEventData.latestBlock.error
                || rawEventData.latestTxs.error
                || rawEventData.nodeState.error
                || rawEventData.status.error) { return; }
            
            setTimeout(function() {
                if(rawEventData.latestBlock.data !== undefined) {
                    $scope.blocks = WsEventDataManager.updateBlocksScopeData(
                        [rawEventData.latestBlock.data],
                        false
                    );
                }

                if(rawEventData.latestTxs.data !== undefined) {
                    $scope.txs = WsEventDataManager.updateTxHashScopeData(rawEventData.latestTxs.data, false);
                }

                // if(rawEventData.status.data !== undefined) {
                //     WsEventDataManager.updateStatusScopeData(rawEventData.status.data);
                // }
                
                // if(rawEventData.nodeState.data !== undefined) {
                //     WsEventDataManager.updateChainNodeStateScopeData(rawEventData.nodeState.data);
                // }

                $scope.$apply();
            }, 100);
        });

        // function updateBlocksScopeData(data, isCachedData) {
        //     var currentSize = collectedBlocks.length;
        //     for(var i = 0; i < data.length; i++) {
        //         const d = data[i];
        //         if(collectedBlocks.includes(d.height)) { continue; }
                
        //         collectedBlocks.push(d.height);
        //         $scope.blocks.unshift({
        //             height: d.height,
        //             hash: d.hash,
        //             txlength: !isCachedData? d.txs.length: d.txlength,
        //             time: new Date(d.time),
        //             txs: d.txs
        //         });
        //         currentSize += 1;
        //         if($scope.blocks[MAX_BLOCKS_COUNT] != undefined) {
        //             console.log("before BLOCK POP");
        //             console.log($scope.blocks);
        //             $scope.blocks.pop();
        //         }
        //     }
        //     saveToCache($scope.blocks, CACHE_KEY_BLOCKS, CACHE_TTL_BLOCK);
        // }
        
        // function updateTxHashScopeData(txsData, isCachedData) {
        //     for(var i = 0; i < txsData.length; i++) {
        //         const data = txsData[i];
        //         if(collectedTxs.includes(data.txid)) { continue;}

        //         const txid = data.txid;
        //         const height = data.height;
        //         const time = data.time;
        //         var totalVout = 0;
                
        //         if(isCachedData) {
        //             totalVout = data.valueOut;
        //         } else {
        //             index = collectedTxs.length;
        //             for(var i = 0; i < data.vout.length; i++) {
        //                 totalVout += data.vout[i].value;
        //             }
        //         }
                
        //         collectedTxs.push(txid);
        //         $scope.txs.unshift({
        //             txid: txid,
        //             valueOut: totalVout,
        //             height: height,
        //             time: time,
        //         });

        //         if($scope.txs[MAX_TX_COUNT] != undefined) {
        //             console.log("before POP");
        //             console.log($scope.txs);
        //             $scope.txs.pop();
        //         }
        //     }
        //     saveToCache($scope.txs, CACHE_KEY_TXS, CACHE_TTL_TXS);
        // }

        $scope.loadData = function () {
            var cache = LocalStore.get(CACHE_KEY_BLOCKS);
            if(cache != undefined) {
                $scope.blocks = WsEventDataManager.updateBlocksScopeData(cache, true)
            }

            cache = LocalStore.get(CACHE_KEY_TXS);
            if(cache != undefined) {
                $scope.txs = WsEventDataManager.updateTxHashScopeData(cache, true);
            }

            // const chainStatus = LocalStore.get(CACHE_KEY_STATUS);
            // if(chainStatus != undefined) {
            //     WsEventDataManager.updateStatusScopeData(chainStatus);
            // }

            // const nodeStateCache = LocalStore.get(CACHE_KEY_NODE_STATE);
            // if(nodeStateCache != undefined) {
            //     WsEventDataManager.updateChainNodeStateScopeData(nodeStateCache);
            // }
            
        };


        // Put in a separate service
        $scope.humanSince = function (time) {
            var m = moment.unix(time);
            return moment.min(m).fromNow();
        };

        $scope.txs = [];
        $scope.blocks = [];
        $scope.chainNodeState = [];
});
