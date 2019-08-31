const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')
const url = require('url')

const config = require('../common/config.json')

router.get('/', function (req, res) {
  return res.render('index', { boardConfig: config.boardConfig, user: req.user, title: '잼팟 - JAM in the POT' })
})

// User 생성, 유저 생성, 회원 가입
router.get('/register', function (req, res) {
  res.render('user/register', { user: req.user })
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
  res.render('user/login', { user: req.user, err: req.query.result })
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

// 프로필 화면
router.get('/profile', async function (req, res, next) {
  try {
    if (req.user === undefined) {
      res.redirect('/login')
    } else {
      const result = await User.findOne({ username: req.user.username })
      res.render('user/profile', { user: req.user, data: result })
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
