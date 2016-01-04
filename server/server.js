//if(Meteor.isServer){
  WebApp.connectHandlers.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return next();
});
 //}
if(Meteor.isServer){
  Accounts.onCreateUser(function (options, user) {
    user.ingredients=[];
  if (options.profile)
    user.profile = options.profile;
  return user;
});
  Meteor.publish(null, function() {
    return Meteor.users.find(this.userId, {fields: {ingredients: 1}});
  });
  Meteor.users.allow({
    update: function(userId, docs, fields, modifier) {
        return true;
    }
});
Meteor.methods({
'fromServer': function(url){
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
},
'fromServer2': function(n, these){
    var url2= "http://food2fork.com/api/get.json?key=" + Meteor.settings.public.F2F_KEY + "&rId=" + these[n].recipe_id;
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
  return Meteor.http.call(method, url2, options);
}
});
};
