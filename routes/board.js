const express = require('express')
const router = express.Router()
const models = require('../models/board')
const User = require('../models/user')
const url = require('url')
const { uploadFile, deleteFile } = require('../common/aws-s3')

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const moment = require('moment')
require('moment-timezone')
moment.tz.setDefault('Asia/Seoul')
moment.locale('ko')

const config = require('../common/config.json')

let Board
// URL 검증 & DB 설정
function init (baseURL) {
  for (const iterator of config.boardList) {
    if (baseURL.slice(1) === iterator) {
      switch (iterator) {
        case 'free':
          Board = models.free
          break
        case 'maplestory':
          Board = models.mapleStory
          break
        default:
          break
      }
      return true
    }
  }
  return false
}

// baseURL 확인해서 Board model 설정
router.use('/', function (req, res, next) {
  if (init(req.baseUrl)) next()
  else return res.sendStatus(404)
})

router.get('/test', function (req, res) {
  res.render('test')
})

// 댓댓글 카운트, 총 댓글 수를 계산하기 위함
function countReply (params) {
  let count = 0
  params.forEach(element => {
    count += element.comments.length
  })
  return count
}

// 게시글 리스트, 메인 화면
router.get('/', async function (req, res, next) {
  try {
    // 베스트 게시글 쿼리
    const start = moment().startOf('week')
    const end = moment().endOf('week')
    const best = await Board.find({ createTime: { $gte: start, $lt: end }, like: { $gt: 0 } })
      .sort({ like: -1, postNumber: -1 })
      .limit(5).populate('user')
    // 전체 게시글 쿼리 with paginate
    const opt = {
      sort: { postNumber: -1 },
      page: Number(req.query.page) || 1,
      limit: 10,
      populate: 'user'
    }
    const result = await Board.paginate({}, opt)
    res.render('index', {
      baseURL: req.baseUrl,
      best: best,
      data: result,
      user: req.user,
      moment: moment,
      countReply: countReply,
      title: '잼팟 - JAM in the POT'
    })
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

// 연속 게시글 작성 불가 기능
async function preventCreatePost (username) {
  const prev = await Board.findOne({}).sort({ _id: -1 }).populate('user')
  if (prev && prev.user.username === username) {
    const result = await User.findOne({ username: username })
    const calc = 60000 - (Date.now() - result.lastpost.getTime())
    if (calc > 0) return moment.duration(calc)
  }
  return undefined
}

// 새글 작성 화면
router.get('/createPost', async function (req, res) {
  if (req.user === undefined) {
    res.redirect('/login')
  } else {
    const countDown = await preventCreatePost(req.user.username)
    if (countDown) return res.render('warning', { user: req.user, message: '연속으로 글을 작성할 수 없습니다.', countDown })
  }
  res.render('createPost', { baseURL: req.baseUrl, user: req.user, data: {} })
})

// 첨부파일 업로드 후 DB 설정값 생성
async function setUploadFile (req, doc) {
  if (req.file) {
    const result = await uploadFile(req.file.originalname, req.file.filename, req.file.path)
    const uploadFileURL = {
      originalFileURL: result.originalFileURL,
      resizeFileURL: result.resizeFileURL,
      originalFileSize: req.file.size,
      video: result.video,
      thumbnailURL: result.thumbnailURL
    }
    doc.uploadFiles = [uploadFileURL]
  }
}

// 기존 첨부파일 삭제 처리
async function resetUploadFile (result) {
  const originalFileURL = new url.URL(result.uploadFiles[0].originalFileURL)
  const resizeFileURL = new url.URL(result.uploadFiles[0].resizeFileURL)
  await deleteFile(originalFileURL.pathname.slice(1))
  await deleteFile(resizeFileURL.pathname.slice(1))
  const thumbnailURL = new url.URL(result.uploadFiles[0].thumbnailURL)
  await deleteFile(thumbnailURL.pathname.slice(1))
}

// 새글 생성과 수정을 함께 처리
router.post('/createPost', upload.single('uploadFile'), async function (req, res, next) {
  try {
    if (req.query.postNumber !== 'undefined') {
      // 게시글 업데이트
      // eslint-disable-next-line prefer-const
      let doc = {
        title: req.body.title,
        content: req.body.content
      }
      // 새로운 첨부파일 업로드
      await setUploadFile(req, doc)
      // 기존의 첨부 파일 삭제
      const result = await Board.findOne({ postNumber: req.query.postNumber })
      if (result.uploadFiles.length && doc.uploadFiles) await resetUploadFile(result)
      // 업데이트 내용 설정
      result.title = doc.title
      result.content = doc.content
      if (doc.uploadFiles) result.uploadFiles = doc.uploadFiles

      await result.save()
      res.redirect(req.baseUrl + '/readPost?postNumber=' + req.query.postNumber)
    } else {
      // 새글 업로드
      const countDown = await preventCreatePost(req.user.username)
      if (countDown) return res.render('warning', { user: req.user, message: '연속으로 글을 작성할 수 없습니다.', countDown })
      // 게시글 저장
      const user = await User.findOne({ username: req.user.username })
      // 게시글 작성 시간 저장
      user.lastpost = Date.now()
      await user.save()
      // eslint-disable-next-line prefer-const
      let doc = {
        user: user._id,
        title: req.body.title,
        content: req.body.content
      }
      // 첨부 파일 저장
      await setUploadFile(req, doc)
      const post = new Board(doc)
      const result = await post.save()
      res.redirect(req.baseUrl + '/readPost?postNumber=' + result.postNumber)
    }
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

// 게시글 읽기 화면
router.get('/readPost', async function (req, res, next) {
  try {
    await Board.updateOne({ postNumber: req.query.postNumber }, { $inc: { hits: 1 } })
    const result = await Board.findOne({ postNumber: req.query.postNumber })
      .populate('user', 'nickname')
      .populate('comments.user', 'nickname')
      .populate('comments.comments.user', 'nickname')
    const next = await Board.findOne({ _id: { $gt: result._id } }).sort({ _id: 1 })
    const prev = await Board.findOne({ _id: { $lt: result._id } }).sort({ _id: -1 })
    res.render('readPost', { data: result, moment: moment, user: req.user, next: next, prev: prev, countReply: countReply })
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

// 게시글 수정 처리
router.get('/updatePost', async function (req, res, next) {
  try {
    if (req.user === undefined) {
      res.redirect('/login')
    } else {
      const result = await Board.findOne({ postNumber: req.query.postNumber }).populate('user')
      if (result.user.nickname !== req.user.nickname) {
        res.render('warning', { user: req.user, message: '권한이 없읍니다.' })
      } else {
        res.render('createPost', { user: req.user, data: result })
      }
    }
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

// 게시글 삭제 처리
router.get('/deletePost', async function (req, res, next) {
  try {
    if (req.user === undefined) {
      res.redirect('/login')
    } else {
      const result = await Board.findOne({ postNumber: req.query.postNumber }).populate('user')
      // 첨부 파일 삭제
      if (result.uploadFiles.length) await resetUploadFile(result)

      if (result.user.nickname !== req.user.nickname) {
        res.render('warning', { user: req.user, message: '권한이 없읍니다.' })
      } else {
        result.delete({ postNumber: req.query.postNumber })
        res.redirect(req.baseUrl)
      }
    }
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

// 추천 반대 처리
router.get('/likePost', async function (req, res) {
  if (req.user !== undefined) {
    let msg
    const voteResult = await Board.findOne({
      postNumber: req.query.postNumber,
      voteList: req.user.username
    })
    if (voteResult) msg = '이미 "추천/반대" 하셨읍니다.'
    else {
      let inc
      if (req.query.disLike === 'true') {
        msg = '"반대" 하셨읍니다.'
        inc = { disLike: 1 }
      } else {
        msg = '"추천" 하셨읍니다.'
        inc = { like: 1 }
      }
      await Board.updateOne({ postNumber: req.query.postNumber },
        { $inc: inc, $push: { voteList: req.user.username } })
    }
    res.send(msg)
  }
})

// 핑 테스트
router.get('/ping', function (req, res) {
  res.status(200).send('pong!')
})

// 댓글 생성
router.post('/createComment', async function (req, res, next) {
  try {
    if (req.user === undefined) {
      res.redirect('/login')
    } else {
      const result = await Board.findOne({ postNumber: req.query.postNumber })
      const user = await User.findOne({ username: req.user.username })
      result.comments.push({
        user: user._id,
        comment: req.body.comment
      })
      await result.save()
      res.redirect(req.header('Referer'))
    }
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

// 댓글 삭제
router.get('/deleteComment', async function (req, res, next) {
  try {
    if (req.user === undefined) req.redirect('/login')
    else {
      const result = await Board.updateOne(
        { postNumber: req.query.postNumber },
        { $pull: { comments: { _id: req.query.commentID } } }
      )
      res.send(result)
    }
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

// 댓댓글 입력
router.post('/replyComment', async function (req, res, next) {
  try {
    if (req.user === undefined) req.redirect('/login')
    else {
      const user = await User.findOne({ username: req.user.username })
      await Board.updateOne(
        // { $elemMatch: { _id: req.query.commentID } } 이렇게도 가능
        { postNumber: req.query.postNumber, 'comments._id': req.query.commentID },
        {
          $push: {
            'comments.$.comments': {
              user: user._id,
              comment: req.body.comment
            }
          }
        }
      )
      res.redirect(req.header('Referer'))
    }
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

// 댓댓글 삭제
router.get('/deleteReply', async function (req, res, next) {
  try {
    if (req.user === undefined) req.redirect('/login')
    else {
      const result = await Board.updateOne(
        { postNumber: req.query.postNumber, 'comments._id': req.query.commentID },
        { $pull: { 'comments.$.comments': { _id: req.query.replyID } } }
      )
      res.send(result)
    }
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

// 댓글 수정
router.post('/updateComment', async function (req, res, next) {
  try {
    if (req.user === undefined) req.redirect('/login')
    else {
      await Board.updateOne(
        // { $elemMatch: { _id: req.query.commentID } } 이렇게도 가능
        { postNumber: req.query.postNumber, 'comments._id': req.query.commentID },
        { $set: { 'comments.$.comment': req.body.comment } }
      )
      res.redirect(req.header('Referer'))
    }
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

// 댓댓글 수정
router.post('/updateReply', async function (req, res, next) {
  try {
    if (req.user === undefined) req.redirect('/login')
    else {
      await Board.updateOne(
        // 이 쿼리 짜는데 엄청 고생했다.
        // 댓글(배열) 수정은 arrayFilters를 안쓰고 가능한데
        // 댓댓글(배열 in 배열) 수정은 arrayFilters가 필수인 것 같다.
        // 혹시 다른 방법이 있는지 확인이 필요하다.
        { postNumber: req.query.postNumber, 'comments._id': req.query.commentID },
        { $set: { 'comments.$.comments.$[array].comment': req.body.comment } },
        { arrayFilters: [{ 'array._id': req.query.replyID }] }
      )
      res.redirect(req.header('Referer'))
    }
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

module.exports = router
