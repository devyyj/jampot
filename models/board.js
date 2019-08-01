const mongoose = require('mongoose')
const mai = require('mongoose-auto-increment')
const mongoosePaginate = require('mongoose-paginate-v2')

mai.initialize(mongoose.connection)

const schema = new mongoose.Schema({
  user: String,
  title: String,
  content: String,
  hits: { type: Number, default: 0 },
  like: { type: Number, default: 0 },
  disLike: { type: Number, default: 0 },
  voteList: [{ user: String }],
  uploadFiles: [String],
  comments: [{
    comment: String,
    user: String,
    createTime: { type: Date, default: Date.now }
  }],
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now }
})

schema.plugin(mai.plugin, { model: 'board', field: 'postNumber', startAt: 1 })
schema.plugin(mongoosePaginate)

module.exports = mongoose.model('board', schema)
