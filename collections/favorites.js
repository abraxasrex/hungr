Faves = new Mongo.Collection('Faves');

Faves.allow({

 insert: function (userId) {
    return userId;
  },

  update: function (userId, doc, fields, modifier) {
if(userId && doc.owner === userId){
			return true;
		}else if(userId && modifier["$push"]){
			return true;
    }
  },

  remove: function (userId, doc) {
    return doc.owner === userId;
  }

})
