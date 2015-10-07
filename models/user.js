var mongoose = require("mongoose");
var bcrypt   = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
  local: {
    email: {type: String, require: true, unique: true},
    password: {type: String, require: true}
  },
  events: [{type: mongoose.Schema.ObjectId, ref: "Event"}]
});

userSchema.methods.encrypt = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.joinEvent = function(event){
  var currentUser = this;
  console.log("event id is: " + event.id);
  console.log("currentUser is: " + currentUser.id);
  User.find({ _id: currentUser.id, events : { $in: event }}, function(err, user){
    if (user) {
      console.log("event attended by user");
    } else {
      currentUser.events.push(event);
      currentUser.save(function(err, user){
        if (err) console.log(err);
        console.log("event pushed into user");
      })
    }
  })
}

var User = mongoose.model("User", userSchema);

module.exports = User;