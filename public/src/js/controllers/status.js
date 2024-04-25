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
        $scope.info = { blocks: 0 };
        $scope.sync = { syncPercentage: 0 };
        $scope.chainNodeState = {};
        const CACHE_KEY = localStore.status.key;
        const CACHE_TTL = localStore.status.ttl;// 24 hours
        const CACHE_KEY_NODE_STATE = localStore.nodeState.key;
        const CACHE_TTL_NODE_STATE = localStore.nodeState.ttl;
        const saveToCache = function(data, key, ttl) {
            LocalStore.set(key, data, ttl);
        }

        const wsTopic = VerusWssClient.getMessageTopic();
        $scope.$on(wsTopic, function(event, rawEventData) {
            // console.log("Getting message from main listener ...", rawEventData)

            if(rawEventData.nodeState.data !== undefined) {
                updateChainNodeStateScopeData(rawEventData.nodeState.data);
            }

            if(
                rawEventData.status.data == undefined 
                || rawEventData.status.error
                || rawEventData.status.data.blocks <= $scope.info.blocks) {
                return;
            }
            
            setTimeout(function() {
                $scope.sync.syncPercentage = rawEventData.nodeState.data.syncPercentage;
                updateScopeData(rawEventData.status.data);
                $scope.$apply();
            }, 500);
        });

        $scope.shortenValue = function (v) {
            if (v == null) return '';
            return parseFloat(v).toFixed(2);
        };
        $scope.convertValue = function (v, unit) {
            if (v == null) return '';
            return UnitConversionService.convert(parseFloat(v), unit);
        };

        const updateScopeData = function(data) {
            $scope.info = data;
            saveToCache(data, CACHE_KEY, CACHE_TTL);
        }

        function updateChainNodeStateScopeData(data) {
            $scope.chainNodeState = data;
            $scope.sync = data;
            $scope.sync.error = data == undefined;
            $scope.sync.status = 'Complete';
            saveToCache($scope.chainNodeState, CACHE_KEY_NODE_STATE, CACHE_TTL_NODE_STATE);
        }

        $scope.getBlockchainStatus = function () {
            var chainStatus = LocalStore.get(CACHE_KEY);
            if(chainStatus != undefined) {
                updateScopeData(chainStatus);
            }

            const nodeStateCache = LocalStore.get(CACHE_KEY_NODE_STATE);
            if(nodeStateCache != undefined) {
                updateChainNodeStateScopeData(nodeStateCache);
            }

            VerusExplorerApi
                .getBlockchainStatus()
                .then(function (statusResult) {
                    if(statusResult.error) { return; }

                    if(!statusResult.data.status.error) {
                        updateScopeData(statusResult.data.status.data);
                    }
                    
                    if(!statusResult.data.nodeState.error) {
                        updateChainNodeStateScopeData(statusResult.data.nodeState.data);
                    }
                    $scope.loaded = true;
                });
        };

        $scope.humanSince = function (time) {
            var m = moment.unix(time / 1000);
            return moment.min(m).fromNow();
        };

        // $scope.getSync = function() {};
    });
