const express = require('express')
const passport = require('passport')
const router = express.Router()
const Board = require('../models/board')
const Account = require('../models/account')
const url = require('url')
const uploadFile = require('../common/aws-s3')

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const moment = require('moment')
require('moment-timezone')
moment.tz.setDefault('Asia/Seoul')
moment.locale('ko')

router.get('/test', function (req, res) {
  res.render('test')
})

router.get('/', async function (req, res, next) {
  const opt = {
    sort: { postNumber: -1 },
    page: Number(req.query.page) || 1,
    limit: 10
  }

  Board.paginate({}, opt, function (err, result) {
    if (err) {
      console.log(err)
    } else {
      res.render('index', { data: result, user: req.user, moment: moment })
    }
  })
})

router.get('/createPost', function (req, res) {
  if (req.user === undefined) {
    res.redirect('/login')
  } else {
    res.render('createPost', { data: {} })
  }
})

router.post('/createPost', upload.single('uploadFile'), async function (req, res) {
  // 게시글 업데이트
  if (req.query.postNumber !== 'undefined') {
    Board.updateOne({ postNumber: req.query.postNumber }, {
      title: req.body.title,
      content: req.body.content
    }, function (err, result) {
      if (err) {
        res.render(err)
      } else {
        console.log(result)
        res.redirect('/readPost?postNumber=' + req.query.postNumber)
      }
    })
  } else {
    // 첨부 파일 저장
    console.log(req.file)
    uploadFile(req.file.originalname, req.file.filename, req.file.path)
    // 게시글 저장
    const post = new Board({
      user: req.user.username,
      title: req.body.title,
      content: req.body.content
    })
    const result = await post.save()
    res.redirect('/readPost?postNumber=' + result.postNumber)    
  }
})

router.get('/readPost', async function (req, res) {
  await Board.updateOne({ postNumber: req.query.postNumber }, { $inc: { hits: 1 } })
  const result = await Board.findOne({ postNumber: req.query.postNumber })
  const next = await Board.findOne({ _id: { $gt: result._id } }).sort({ _id: 1 })
  const prev = await Board.findOne({ _id: { $lt: result._id } }).sort({ _id: -1 })
  res.render('readPost', { data: result, moment: moment, user: req.user, next: next, prev: prev })
})

router.get('/updatePost', function (req, res) {
  if (req.user === undefined) {
    res.redirect('/login')
  } else {
    Board.findOne({ postNumber: req.query.postNumber }, function (err, result) {
      if (err) {
        res.render(err)
      } else {
        if (result.user !== req.user.username) {
          res.render('warning')
        } else {
          res.render('createPost', { data: result })
        }
      }
    })
  }
})

router.get('/deletePost', function (req, res) {
  if (req.user === undefined) {
    res.redirect('/login')
  } else {
    Board.findOne({ postNumber: req.query.postNumber }, function (err, result) {
      if (err) {
        res.send(err)
      } else {
        if (result.user !== req.user.username) {
          res.render('warning')
        } else {
          result.delete({ postNumber: req.query.postNumber })
          res.redirect('/')
        }
      }
    })
  }
})

router.get('/likePost', async function (req, res) {
  if (req.user !== undefined) {
    let msg
    const voteResult = await Board.findOne({
      postNumber: req.query.postNumber,
      'voteList.user': req.user.username
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
        { $inc: inc, $push: { voteList: { user: req.user.username } } })
    }
    res.send(msg)
  }
})

// passport
router.get('/register', function (req, res) {
  res.render('register', {})
})

router.post('/register', function (req, res) {
  Account.register(new Account({ username: req.body.username }), req.body.password, function (err, account) {
    if (err) {
      return res.render('register', { err: err })
    }
    passport.authenticate('local')(req, res, function () {
      res.redirect('/')
    })
  })
})

router.get('/login', function (req, res) {
  const backURL = req.header('Referer')
  if (backURL) {
    const parseURL = new url.URL(backURL)
    if (parseURL.pathname !== '/login') {
      req.session.backURL = parseURL.href
    }
  }
  res.render('login', { err: req.query.result })
})

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

router.get('/logout', function (req, res) {
  req.logout()
  res.redirect('/')
})

router.get('/ping', function (req, res) {
  res.status(200).send('pong!')
})

router.post('/createComment', async function (req, res) {
  if (req.user === undefined) {
    res.redirect('/login')
  } else {
    const result = await Board.findOne({ postNumber: req.query.postNumber })
    result.comments.push({
      comment: req.body.comment,
      user: req.user.username
    })
    await result.save()
    res.redirect(req.header('Referer'))
  }
})

module.exports = router
