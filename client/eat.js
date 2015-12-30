if (Meteor.isClient) {
  //meteor configuration//
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
  //UI.registerHelper("indexedArray", function(context, options) {
   //if (context) {
  //   return context.map(function(item, index) {
  //     item._index = index;
  //   return item;
  //  });
  // }
//});
  //angular app//
  angular.module('Hungr', ['angular-meteor', 'accounts.ui']);

  angular.module('Hungr').controller('mainController',function($scope, $meteor, $http) {

    // initial vars ///
    var foodPending;
    var placePending;
    $scope.noIns = false;
    $scope.noOuts = false;
    $scope.preInHits = [];
    $scope.outHits = [];
    $scope.inHits = [];
    $scope.results = 'normal';
    if (Meteor.userId() && Meteor.userId().ingredients){
      $scope.ingredients = Meteor.user().ingredients;
    } else {
      $scope.ingredients = [];
    }

    $scope.favorites= $meteor.collection(Faves);

    $scope.mainShow = 'console';
    if ($scope.radius === undefined) {
      $scope.radius = 5;
    }
    //helper functions //
    $scope.loggedIn = function() {
      if (Meteor.userId()) {
        return true;
      }
    };
    $scope.faveIns = $meteor.collection(function() {
      var thisUser = Meteor.userId();
      return Faves.find({owner: thisUser, type:"in"});
    });
    $scope.faveOuts = $meteor.collection(function() {
      var thisUser = Meteor.userId();
      return Faves.find({owner: thisUser, type:"out"});
    });
    ///  events //

    $scope.selectFaves = function() {
      if ($scope.results === 'favorites') {
        $scope.results = 'normal';
      } else {
        $scope.results = 'favorites';
      }
    };
    $scope.removeFave= function(thisHit){
      var index = $scope.favorites.indexOf(thisHit);
      $scope.favorites.splice(index, 1);
    }
    $scope.remove = function(item) {
      var index = $scope.ingredients.indexOf(item);
      $scope.ingredients.splice(index, 1);
    }
    $scope.add = function() {
      $scope.ingredients.push($scope.addKitchen);
      $scope.addKitchen = "";
    }
    $scope.showIt = function(toShow) {
      if ($scope.mainShow == toShow) {
        $scope.mainShow = "console";
      } else {
        $scope.mainShow = toShow;
      }
    }
    $scope.getMoreOuts = function() {
      $scope.outHits.splice(0, 3);
    }
    $scope.enterSubmit = function(keyEvent) {
      if (keyEvent.which === 13) {
        $scope.foodChange();
        $scope.placeChange();
      }
    }
    $scope.saveIns = function(thisHit){
      var thisUser= Meteor.userId();
      $scope.favorites.push({owner: thisUser, type:"in", hit: thisHit});
    };
    $scope.saveOuts = function(thisHit){
      var thisUser= Meteor.userId();
        $scope.favorites.push({owner: thisUser, type:"out", hit: thisHit});
    };
    // react to changes //
    $scope.foodChange = function() {
      if ($scope.searchFood.length) {
        inFetch();
      }
      if ($scope.searchPlace.length) {
        clearTimeout(placePending);
      }
      placePending = setTimeout(outFetch(), 800);
    };
    $scope.placeChange = function() {
      if (placePending) {
        clearTimeout(placePending);
      }
      placePending = setTimeout(outFetch(), 800);
    };
    $scope.matchIt = function(these) {
      for (var m = 0; m < $scope.ingredients.length; m++) {
        var toTest = new RegExp($scope.ingredients[m], 'gi');
        if (these.match(toTest)) {
          return true;
        }
      }
    }
    $scope.roundIt = function(number) {
      return Math.round(number);
    }
    function spliceIt() {
      $scope.preInHits.splice(0, 3);
      $scope.$apply();
    }

    ///http calls //
    var getIndividual = function() {
      //  get recipe ingredients with server-side call //
      console.log("pre hits are.... " + $scope.preInHits);
      var these = $scope.preInHits;
      for (var i = 0; i < $scope.preInHits.length; i++) {
        Meteor.call('fromServer2', i, these, function(err, results) {
          if (!err) {
            console.log("get individual response is" + results.content)
            var parsed2 = JSON.parse(results.content);
            $scope.inHits.push(parsed2);
            $scope.$apply();
            setTimeout(spliceIt(), 800);
          } else {
            console.log("couldn't fetch individuals");
          }
        });
      }
    };
    //get more individuals //
    $scope.getMoreIns = function() {
      $scope.inHits.splice(0, 3);
      getIndividual();
    }

    function outFetch() {
      // foursquare get //
      var currentRadius = $scope.radius * 1609.344;
      $scope.outHits = [];
      $http.get("https://api.foursquare.com/v2/venues/explore?openNow=1&query=" + $scope.searchFood + "&near=" + $scope.searchPlace + "&radius=" + currentRadius + "&client_id=" + Meteor.settings.public.CLIENT_ID + "&client_secret=" + Meteor.settings.public.CLIENT_SECRET + "&v=" + "20130815").success(function(results) {
        console.log("results for foursquare are....." + results.response.groups[0].items);
        $scope.outHits = results.response.groups[0].items;
        $scope.noOuts = false;
      }, function errorCallback(response) {
        $scope.noOuts = true;
        $scope.outHits = [];
      });
    };

    function inFetch() {
      // food2fork get; have to use meteor methods to resolve CORS issues //
      $scope.inHits = [];
      var url = "http://food2fork.com/api/search.json?key=" + Meteor.settings.public.F2F_KEY + "&q=" + $scope.searchFood + "&sort=r";
      Meteor.call("fromServer", url, function(err, results) {
        if (!err) {
          $scope.noIns = false;
          console.log("content response of first call is" + results.content);
          var parsed = JSON.parse(results.content);
          $scope.preInHits = parsed.recipes;
          setTimeout(getIndividual(), 500);
        } else {
          $scope.noIns = true;
          $scope.noIns = [];
        }
      });
    };
  });
  // image height squaring directive //
  angular.module('Hungr').directive('squared', function() {
    return {
      restrict: "A",
      link: function(scope, element) {
        scope.getWidth = function() {
          return $(element).width();
        };
        scope.$watch(scope.getWidth, function(width) {
          $(element).height(width);
        });
      }
    }
  });
};
