var express = require('express')
var passport = require('passport')
var router = express.Router()
const Board = require('../models/board')
var Account = require('../models/account')
const moment = require('moment')
const url = require('url')
require('moment-timezone')
moment.tz.setDefault('Asia/Seoul')

router.get('/test', function (req, res) {
  res.render('test')
})

router.get('/', function (req, res, next) {
  Board.find().sort({ postNumber: -1 }).exec(function (err, result) {
    if (err) {
      res.render(err)
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

router.post('/createPost', function (req, res) {
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
    const post = new Board({
      user: req.user.username,
      title: req.body.title,
      content: req.body.content
    })

    post.save(function (err, result) {
      if (err) {
        res.render(err)
      } else {
        res.redirect('/readPost?postNumber=' + result.postNumber)
      }
    })
  }
})

router.get('/readPost', function (req, res) {
  Board.findOne({ postNumber: req.query.postNumber }, function (err, result) {
    if (err) {
      res.render(err)
    } else {
      res.render('readPost', { data: result, moment: moment })
    }
  })
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
    const parseURL = url.parse(backURL)
    if (parseURL.pathname !== '/login') {
      req.session.backURL = parseURL.pathname
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

router.post('/createComment', function (req, res) {
  if (req.user === undefined) {
    res.redirect('/login')
  } else {
    Board.findOne({ postNumber: req.query.postNumber }, function (err, result) {
      if (err) {
        res.send(err)
      } else {
        result.comments.push({
          comment: req.body.comment,
          user: req.user.username
        })
        result.save(function (err, result) {
          if (err) {
            res.send(err)
          } else {
            res.redirect(req.header('Referer'))
          }
        })
      }
    })
  }
})

module.exports = router
