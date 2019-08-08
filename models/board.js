const mongoose = require('mongoose')
const mai = require('mongoose-auto-increment')
const mongoosePaginate = require('mongoose-paginate-v2')

mai.initialize(mongoose.connection)

// 필드 이름 규칙을 통일할 필요가 있음
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  title: String,
  content: String,
  hits: { type: Number, default: 0 },
  like: { type: Number, default: 0 },
  disLike: { type: Number, default: 0 },
  voteList: [String],
  // uploadFiles: [String],
  uploadFiles: [{
    originalFileURL: String,
    resizeFileURL: String,
    video: Boolean,
    originalFileSize: Number,
    resizeFileSize: Number
  }],
  // 댓글
  comments: [{
    comment: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    createTime: { type: Date, default: Date.now },
    // 댓댓글
    comments: [{
      comment: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
      createTime: { type: Date, default: Date.now }
    }]
  }],
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: Date.now }
})

schema.plugin(mai.plugin, { model: 'board', field: 'postNumber', startAt: 1 })
schema.plugin(mongoosePaginate)

module.exports = mongoose.model('board', schema)
