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

/**
 * 게시판 늘리는 방법
 * 1.mongoose model을 추가
 * 2.config.json에 board config 추가
 * 2-1.board url, routing url, exports object key를 같게 한다.
 * 3.board.js에 init 함수 수정
 */
const freeSchema = new mongoose.Schema(boardSchema)
freeSchema.plugin(mai.plugin, { model: 'free', field: 'postNumber', startAt: 1 })
freeSchema.plugin(mongoosePaginate)

const supportSchema = new mongoose.Schema(boardSchema)
supportSchema.plugin(mai.plugin, { model: 'support', field: 'postNumber', startAt: 1 })
supportSchema.plugin(mongoosePaginate)

const noticeSchema = new mongoose.Schema(boardSchema)
noticeSchema.plugin(mai.plugin, { model: 'notice', field: 'postNumber', startAt: 1 })
noticeSchema.plugin(mongoosePaginate)

module.exports = {
  notice: mongoose.model('notice', noticeSchema),
  free: mongoose.model('free', freeSchema),
  support: mongoose.model('support', supportSchema)
}
