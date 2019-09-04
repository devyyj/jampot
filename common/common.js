/* eslint-disable no-unused-vars */
const moment = require('moment')

// 베스트 게시글 쿼리
async function queryBestPost (model) {
  const start = moment().startOf('week')
  const end = moment().endOf('week')
  const best = await model.find({ createTime: { $gte: start, $lt: end }, like: { $gt: 0 } })
    .sort({ like: -1, postNumber: -1 })
    .limit(5).populate('user')
  return best
}

module.exports = {
  queryBestPost: queryBestPost
}
