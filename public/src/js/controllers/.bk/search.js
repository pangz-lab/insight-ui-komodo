'use strict';

angular.module('insight.search').controller('SearchController',
  function($scope, $routeParams, $location, $timeout, Global, Block, Transaction, Address, BlockByHeight, VerusdRPC) {
  $scope.global = Global;
  $scope.loading = false;

  var _badQuery = function() {
    $scope.badQuery = true;

    $timeout(function() {
      $scope.badQuery = false;
    }, 2000);
  };

  var _resetSearch = function() {
    $scope.q = '';
    $scope.loading = false;
  };

  $scope.search = function() {
    var q = $scope.q;
    $scope.badQuery = false;
    $scope.loading = true;

    
    const lastChar = q.charAt(q.length - 1);

    if(lastChar === '@') {
      VerusdRPC.getIdentity([q])
        .then(function(data) {
          if(data.result) {
            const response = data.result;
            //Request is a VerusID - get the address
            $location.path('address/' + response.identity.identityaddress);
            _resetSearch();
            return;
          }

          $scope.loading = false;
          _resetSearch();
          _badQuery();
        });
        return;
    }

    VerusdRPC.getBlockDetail(q)
    .then(function(data) {
      if(data.result) {
        const response = data.result;
        // Either block height or block hash
        $location.path('block/' + response.hash);
        _resetSearch();
        return;
      }

      VerusdRPC.getAddressBalance([q])
      .then(function(data) {
        if(data.result) {
          const response = data.result;
          //Request is address
          $location.path('address/' + q);
          _resetSearch();
          return;
        }

        VerusdRPC.getRawTransaction(q)
        .then(function(data) {
          if(data.result) {
            const response = data.result;
            //Request is a transaction hash
            $location.path('tx/' + q);
            _resetSearch();
            return;
          }

          $scope.loading = false;
          _resetSearch();
          _badQuery();
        })
      })
    });
// 2558891ef5d54ce3e82503655a22c05a774e62be695bbe26454dae93de480cac - 64
// iHbTMYB43xqqFVmEqJkqff6GrZDQoaiq6g - 34

    // Block.get({
    //   blockHash: q
    // }, function() {
    //   _resetSearch();
    //   $location.path('block/' + q);
    // }, function() { //block not found, search on TX
    //   Transaction.get({
    //     txId: q
    //   }, function() {
    //     _resetSearch();
    //     $location.path('tx/' + q);
    //   }, function() { //tx not found, search on Address
    //     Address.get({
    //       addrStr: q
    //     }, function() {
    //       _resetSearch();
    //       $location.path('address/' + q);
    //     }, function() { // block by height not found
    //       if (isFinite(q)) { // ensure that q is a finite number. A logical height value.
    //         BlockByHeight.get({
    //           blockHeight: q
    //         }, function(hash) {
    //           _resetSearch();
    //           $location.path('/block/' + hash.blockHash);
    //         }, function() { //not found, fail :(
    //           $scope.loading = false;
    //           _badQuery();
    //         });
    //       }
    //       else {
    //         $scope.loading = false;
    //         _badQuery();
    //       }
    //     });
    //   });
    // });
  };

});
