'use strict';

angular.module('insight.address').controller('AddressController',
  function($scope, $rootScope, $routeParams, $location, Global, Address, getSocket, VerusdRPC, ScrollService) {
    $scope.global = Global;

    $rootScope.scrollToTop = function() {
      ScrollService.scrollToTop();
    };
    $rootScope.scrollToBottom = function() {
      ScrollService.scrollToBottom();
    };

    // var socket = getSocket($scope);
    // var addrStr = $routeParams.addrStr;

    // var _startSocket = function() {
    //   socket.on('bitcoind/addresstxid', function(data) {
    //     if (data.address === addrStr) {
    //       $rootScope.$broadcast('tx', data.txid);
    //       var base = document.querySelector('base');
    //       var beep = new Audio(base.href + '/sound/transaction.mp3');
    //       beep.play();
    //     }
    //   });
    //   socket.emit('subscribe', 'bitcoind/addresstxid', [addrStr]);
    // };

    // var _stopSocket = function () {
    //   socket.emit('unsubscribe', 'bitcoind/addresstxid', [addrStr]);
    // };

    // socket.on('connect', function() {
    //   _startSocket();
    // });

    // $scope.$on('$destroy', function(){
    //   _stopSocket();
    // });

    $scope.params = $routeParams;

    $scope.findOne = function() {
      const address = $routeParams.addrStr;
      $rootScope.flashMessage = null;
      $rootScope.currentAddr = address;
      $rootScope.titleDetail = address.substring(0, 7) + '...';
      $scope.isIdentityAddress = address.startsWith("i") || address.endsWith("@");
      $scope.address = $routeParams;
      $scope.balance = 0;
      $scope.totalReceived = 0;
      $scope.totalSent = 0;

      if($scope.isIdentityAddress) {
        VerusdRPC.getIdentity([address])
        .then(function(data) {
          const r = data.result;
          const identityNonRootName = r.friendlyname;
          const identityRootName = r.identity.name;
          $scope.primaryAddressIds = r.identity.primaryaddresses;
          $scope.identityName = (r.identity.parent == r.identity.systemid) ? identityRootName : identityNonRootName;
        });
      }

      VerusdRPC.getAddressBalance([address])
      .then(function(data) {
        if(data.error) {
          $rootScope.flashMessage = 'Backend Error : ' + data.error.message + '(' + data.error.code+ ')';
          // $location.path('/');
          return;
        }
        const r = data.result;
        // console.log("Data from address controller");
        // console.log(data);
        // // _paginate(data.result);
        // // $rootScope.titleDetail = address.addrStr.substring(0, 7) + '...';
        // $rootScope.titleDetail = $routeParams.addrStr.substring(0, 7) + '...';
        // $rootScope.flashMessage = null;
        // // $scope.address = $routeParams.addrStr;
        // $scope.address = $routeParams;
        console.log(r);
        const balance = r.balance == undefined? 0: r.balance;
        $scope.balance = ((balance).toFixed(8)/1e8).toString();
        $scope.totalReceived = ((r.received).toFixed(8)/1e8).toString();
        $scope.totalSent = ((r.received - balance)/1e8).toString();
      })
      .catch(function(e) {
        if (e.status === 400) {
          $rootScope.flashMessage = 'Invalid Address: ' + $routeParams.addrStr;
        } else if (e.status === 503) {
          $rootScope.flashMessage = 'Backend Error. ' + e.data;
        } else {
          $rootScope.flashMessage = 'Address Not Found';
        }
        $location.path('/');
      });

    //   // Address.get({
    //   //     addrStr: $routeParams.addrStr
    //   //   },
    //   //   function(address) {
    //   //     $rootScope.titleDetail = address.addrStr.substring(0, 7) + '...';
    //   //     $rootScope.flashMessage = null;
    //   //     $scope.address = address;
    //   //   },
    //   //   function(e) {
    //   //     if (e.status === 400) {
    //   //       $rootScope.flashMessage = 'Invalid Address: ' + $routeParams.addrStr;
    //   //     } else if (e.status === 503) {
    //   //       $rootScope.flashMessage = 'Backend Error. ' + e.data;
    //   //     } else {
    //   //       $rootScope.flashMessage = 'Address Not Found';
    //   //     }
    //   //     $location.path('/');
    //   //   });
    };

  });