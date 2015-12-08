//if(Meteor.isServer){
  WebApp.connectHandlers.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return next();
});
 //}
if(Meteor.isServer){
Meteor.methods({
'inFetch': function(url){
  var method = 'GET';
      var options = {
        crossDomain: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, PUT, DELETE, GET, OPTIONS',
              'Access-Control-Request-Method': '*',
              'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
              'content-type': 'application/json'
        }
      }
    this.unblock();
  return Meteor.http.call(method, url, options);
}
});
};
