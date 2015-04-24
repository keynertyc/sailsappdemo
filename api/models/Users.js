/**
* Users.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
    },
    email: {
      type: 'email',
      required: true
    },
    password: {
      type: 'string',
      required: true
    },
    isLoggedIn: {
      type: 'boolean',
      defaultsTo: 'false'
    },
    toJSON: function(){
      var obj = this.toObject();
      delete obj.password;
      return obj
    }
  },


  beforeCreate: function(attributes, next) {

    var bcrypt = require('bcrypt');

    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(attributes.password, salt, function(err, hash) {
          if (err) return next(err);

          attributes.password = hash;
          next();
        });
    });
  },

};
