var mongoose = require('mongoose')
var Schema = mongoose.Schema
var passportLocalMongoose = require('passport-local-mongoose')

var user = new Schema({
  username: String,
  password: String,
  nickname: { type: String, required: true, unique: true, lowercase: true },
  lastpost: Date
})

user.plugin(passportLocalMongoose, { usernameLowerCase: true })

module.exports = mongoose.model('user', user)
