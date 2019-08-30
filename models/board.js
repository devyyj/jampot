const mongoose = require('mongoose')
const mai = require('mongoose-auto-increment')
const mongoosePaginate = require('mongoose-paginate-v2')

mai.initialize(mongoose.connection)

const boardSchema = {
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
    originalFileSize: Number,
    resizeFileSize: Number,
    video: Boolean,
    thumbnailURL: String
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
}

// 게시판이 늘어남에 따라 함께 늘어난다.
const freeSchema = new mongoose.Schema(boardSchema)
freeSchema.plugin(mai.plugin, { model: 'maplestory', field: 'postNumber', startAt: 1 })
freeSchema.plugin(mongoosePaginate)

const maplestorySchema = new mongoose.Schema(boardSchema)
maplestorySchema.plugin(mai.plugin, { model: 'free', field: 'postNumber', startAt: 1 })
maplestorySchema.plugin(mongoosePaginate)

const supportSchema = new mongoose.Schema(boardSchema)
supportSchema.plugin(mai.plugin, { model: 'support', field: 'postNumber', startAt: 1 })
supportSchema.plugin(mongoosePaginate)

module.exports = {
  mapleStory: mongoose.model('maplestory', maplestorySchema),
  free: mongoose.model('free', freeSchema),
  support: mongoose.model('support', freeSchema)
}
