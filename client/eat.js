
if(Meteor.isClient){
  angular.module('Hungr', ['angular-meteor']);
  angular.module('Hungr').controller('mainController', function($scope, $http){
    // initial vars ///
    var foodPending; var placePending; $scope.noIns=false; $scope.noOuts=false;  $scope.inHits= []; $scope.ingredients= [];
    if($scope.radius === undefined){
     $scope.radius = 10;
      }
    //draw banner/
    $scope.draw=function(){
  var canvas = document.getElementsByTagName('canvas')[0];
  var ctx = canvas.getContext('2d');
    var gradient=ctx.createLinearGradient(0,0,canvas.width,0);
    gradient.addColorStop("0","#ff8c66");
    gradient.addColorStop(".45","#ffb366");
    gradient.addColorStop(".55"," #ffd966");
    ctx.fillStyle=gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };
  $scope.draw();
   // react to changes //
    $scope.foodChange = function(){
     if(foodPending){
       clearTimeout(foodPending);
     }
       foodPending = setTimeout(inFetch(), 1000);
    if($scope.searchPlace.length){
      clearTimeout(placePending);
    }
     placePending= setTimeout(outFetch(), 1000);
   };
   $scope.placeChange = function(){
     if(placePending && ($scope.searchPlace.length && $scope.searchFood.length)){
         clearTimeout(placePending);
       }
         placePending = setTimeout(outFetch(), 1000);
   };
  $scope.match= function(these){
    for(var k=0; k< $scope.ingredients.length; k++){
        var toTest= new RegExp($scope.ingredients[k], 'i');
        if(these.match(toTest)){
          return true;
        }
    }
  }
//$scope.highlight = function(haystack, needle) {
  //  if(!needle) {
    //    return $scope.trustAsHtml(haystack);
  //  }
  //  return $scope.trustAsHtml(haystack.replace(new RegExp(needle, "gi"), function(match) {
  //      return '<span class="highlightedText">' + match + '</span>';
  //  }));
//};
  $scope.remove = function(item) {
  var index = $scope.ingredients.indexOf(item);
  $scope.ingredients.splice(index, 1);
}
$scope.add= function(){
      $scope.ingredients.push($scope.addKitchen);
      $scope.addKitchen= "";
}
$scope.slideIt= function(){
   $(".about_inner").toggle();
   $(".console").toggle();
}
$scope.select = function(){
  this.setSelectionRange(0, this.value.length);
}

   ///http functions //
  var getIndividual= function(j, these){
    //  get recipe ingredients with server-side call //
      var url2= "http://food2fork.com/api/get.json?key=" + Meteor.settings.public.F2F_KEY + "&rId=" + these[j].recipe_id;
      Meteor.call('inFetch', url2, function(err, results){
        if(!err){
              $scope.inHits.push(JSON.parse(results.content));
        }else{
          $scope.noIns= true;
        }
    });
};
   function outFetch(){
    // foursquare get //
  var currentRadius= $scope.radius * 1609.344;
  $scope.outHits=[];
     $http.get("https://api.foursquare.com/v2/venues/explore?openNow=1&query=" + $scope.searchFood + "&near=" + $scope.searchPlace + "&radius=" + currentRadius + "&client_id=" + Meteor.settings.public.CLIENT_ID + "&client_secret=" + Meteor.settings.public.CLIENT_SECRET + "&v=" +  "20130815").success(function(results){
       $scope.outHits = results.response.groups[0].items;
        $scope.noOuts=false;
     }, function errorCallback(response){
       $scope.noOuts=true;
       $scope.outHits=[];
     });
   };
    function inFetch(){
      // food2fork get // have to use meteor methods to resolve CORS issues //
      var url= "http://food2fork.com/api/search.json?key=" + Meteor.settings.public.F2F_KEY + "&q=" + $scope.searchFood;
      Meteor.call("inFetch", url,  function(err, results){
        if(!err){
          $scope.noIns= false;
          var parsed= JSON.parse(results.content);
          var preInHits= parsed.recipes;
          console.log("pre's are" + preInHits)
          //keep call amount low so i don't have to pay for this api $$$  ////
      for (var i= 0; i < 3; i++) {
              getIndividual(i, preInHits);
            }
              }else{
                $scope.noIns=true;
               }
          });
        };
  });
};
