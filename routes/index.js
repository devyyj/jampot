const express = require('express')
const passport = require('passport')
const router = express.Router()
const Board = require('../models/board')
const User = require('../models/user')
const url = require('url')
const { uploadFile, deleteFile } = require('../common/aws-s3')

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const moment = require('moment')
require('moment-timezone')
moment.tz.setDefault('Asia/Seoul')
moment.locale('ko')

router.get('/test', function (req, res) {
  res.render('test')
})

// 게시글 리스트, 메인 화면
router.get('/', async function (req, res, next) {
  try {
    const opt = {
      sort: { postNumber: -1 },
      page: Number(req.query.page) || 1,
      limit: 10,
      populate: 'user'
    }
    const result = await Board.paginate({}, opt)
    res.render('index', { data: result, user: req.user, moment: moment })
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
  res.render('createPost', { user: req.user, data: {} })
})

// 첨부파일 업로드 후 DB 설정값 생성
async function setUploadFile (req, doc) {
  if (req.file) {
    const result = await uploadFile(req.file.originalname, req.file.filename, req.file.path)
    const uploadFileURL = {
      originalFileURL: result.originalFileURL,
      resizeFileURL: result.resizeFileURL,
      video: result.video
    }
    doc.uploadFiles = [uploadFileURL]
  }
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
      if (result.uploadFiles.length && doc.uploadFiles) {
        const originalFileURL = new url.URL(result.uploadFiles[0].originalFileURL)
        const resizeFileURL = new url.URL(result.uploadFiles[0].resizeFileURL)
        await deleteFile(originalFileURL.pathname.slice(1))
        await deleteFile(resizeFileURL.pathname.slice(1))
      }
      result.title = doc.title
      result.content = doc.content
      if (doc.uploadFiles) result.uploadFiles = doc.uploadFiles

      await result.save()
      res.redirect('/readPost?postNumber=' + req.query.postNumber)
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
      res.redirect('/readPost?postNumber=' + result.postNumber)
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
      .populate('comments.user')
    const next = await Board.findOne({ _id: { $gt: result._id } }).sort({ _id: 1 })
    const prev = await Board.findOne({ _id: { $lt: result._id } }).sort({ _id: -1 })
    res.render('readPost', { data: result, moment: moment, user: req.user, next: next, prev: prev })
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
      if (result.uploadFiles.length) {
        const originalFileURL = new url.URL(result.uploadFiles[0].originalFileURL)
        const resizeFileURL = new url.URL(result.uploadFiles[0].resizeFileURL)
        await deleteFile(originalFileURL.pathname.slice(1))
        await deleteFile(resizeFileURL.pathname.slice(1))
      }
      if (result.user.nickname !== req.user.nickname) {
        res.render('warning', { user: req.user, message: '권한이 없읍니다.' })
      } else {
        result.delete({ postNumber: req.query.postNumber })
        res.redirect('/')
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

// User 생성, 유저 생성, 회원 가입
router.get('/register', function (req, res) {
  res.render('register', { user: req.user })
})

router.post('/register', function (req, res) {
  User.register(new User({ username: req.body.username, nickname: req.body.nickname }),
    req.body.password, function (err, User) {
      if (err) {
        return res.render('register', { user: req.user, err: err })
      }
      passport.authenticate('local')(req, res, function () {
        res.redirect('/')
      })
    })
})

// 로그인 화면
router.get('/login', function (req, res) {
  const backURL = req.header('Referer')
  if (backURL) {
    const parseURL = new url.URL(backURL)
    if (parseURL.pathname !== '/login') {
      req.session.backURL = parseURL.href
    }
  }
  res.render('login', { user: req.user, err: req.query.result })
})

// 로그인 처리
router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) { return next(err) }
    if (!user) { return res.redirect('/login?result=fail') }
    req.logIn(user, function (err) {
      if (err) { return next(err) }
      const backURL = req.session.backURL || '/'
      delete req.session.backURL
      return res.redirect(backURL)
    })
  })(req, res, next)
})

// 로그아웃 처리
router.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})

// 핑 테스트
router.get('/ping', function (req, res) {
  res.status(200).send('pong!')
})

// 댓글 처리
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

// 프로필 화면
router.get('/profile', async function (req, res, next) {
  try {
    if (req.user === undefined) {
      res.redirect('/login')
    } else {
      const result = await User.findOne({ username: req.user.username })
      res.render('profile', { user: req.user, data: result })
    }
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

// 프로필 재설정
router.post('/profile', async function (req, res, next) {
  try {
    const result = await User.findOne({ username: req.user.username })
    const authResult = await result.authenticate(req.body.oldpassword)
    if (authResult.error) res.render('warning', { user: req.user, message: '비밀번호가 일치하지 않습니다.' })
    else {
      result.nickname = req.body.nickname
      if (req.body.newpassword) await result.changePassword(req.body.oldpassword, req.body.newpassword)
      await result.save()
      res.redirect('/')
    }
  } catch (error) {
    console.log(error)
    if (error.code === 11000) next({ message: '중복 되는 닉네임 입니다.' })
    else next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

module.exports = router
