const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')
const url = require('url')
const moment = require('moment')
const config = require('../common/config.json')
const models = require('../models/board')
const { queryBestPost } = require('../common/common')
const sendMail = require('../common/aws-ses')

router.get('/test', async function (req, res) {
  await sendMail('devyyj@gmail.com', 'test subject', 'test body')
  res.send('test')
})

router.get('/', async function (req, res) {
  const boards = []
  // 메인 화면에 출력할 베스트 게시물 쿼리
  for (const key in models) {
    // eslint-disable-next-line no-prototype-builtins
    if (models.hasOwnProperty(key)) {
      const model = models[key]
      const best = {}
      best.best = await queryBestPost(model)
      // 게시판 baseURL을 얻을 수 없기 때문에 key를 사용
      best.baseURL = key
      // baord Name 설정
      for (const iterator of config.boardConfig) {
        if (iterator.board === best.baseURL) best.boardName = iterator.boardName
      }
      // 오늘 생성된 게시글의 수
      const start = moment().startOf('day')
      const end = moment().endOf('day')
      best.newPost = await model.find({ createTime: { $gte: start, $lt: end } }).countDocuments()
      boards.push(best)
    }
  }
  return res.render('index', { boards: boards, user: req.user, title: '잼팟 - JAM in the POT' })
})

// User 생성, 유저 생성, 회원 가입
router.get('/register', function (req, res) {
  res.render('user/register', { user: req.user })
})

router.post('/register', function (req, res, next) {
  try {
    User.register(new User({ username: req.body.username, nickname: req.body.nickname, email: req.body.email }),
      req.body.password, function (error, User) {
        if (error) {
          let message
          console.log(error)
          if (error.code === 11000) message = '닉네임 또는 이메일이 중복됩니다.' + error.message
          else if (error.name === 'UserExistsError') message = '아이디가 중복됩니다.'
          else message = '알 수 없는 오류가 발생했습니다.'
          next({ message: message })
        } else {
          passport.authenticate('local')(req, res, function () {
            res.redirect('/')
          })
        }
      })
  } catch (error) {
    console.log(error)
  }
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
  res.render('user/login', { rememberID: req.cookies.rememberID, user: req.user, err: req.query.result })
})

// 로그인 처리
router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err) { return next(err) }
    if (!user) { return res.redirect('/login?result=fail') }
    // 아이디 저장 기능
    if (req.body.rememberID) {
      const cookieOption = {
        path: '/login',
        httpOnly: true,
        expires: new Date(moment().add(1, 'years'))
      }
      res.cookie('rememberID', user.username, cookieOption)
    } else res.clearCookie('rememberID', { path: '/login' })
    // 로그인하기 전 페이지로 리다이렉트
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
      result.email = req.body.email
      if (req.body.newpassword) await result.changePassword(req.body.oldpassword, req.body.newpassword)
      await result.save()
      res.redirect('/')
    }
  } catch (error) {
    console.log(error)
    if (error.code === 11000) next({ message: '닉네임 또는 이메일이 중복됩니다.' + error.message })
    else next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

// 아이디 패스워드 찾기 화면
router.get('/findpw', function (req, res, next) {
  res.render('user/findPW', { user: req.user })
})

// 아이디 패스워드 찾기 메일 발송
router.post('/findpw', async function (req, res, next) {
  try {
    const authcode = Date.now()
    await User.findOneAndUpdate({ email: req.body.email }, { authcode: authcode })
    const body = `
    비밀번호를 변경하려면 다음 링크를 클릭하세요.
    https://jampot.kr/changepw?authcode=${authcode}
    다른 사람에게 링크를 공유하지 마세요!
    `
    await sendMail(req.body.email, '잼팟 아이디/비밀번호 찾기', body)
    res.render('warning', { message: req.body.email + '로 메일을 보냈읍니다!' })
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

// 패스워드 변경 페이지
router.get('/changepw', async function (req, res, next) {
  try {
    const result = await User.findOne({ authcode: req.query.authcode })
    if (result) res.render('user/changePW', { data: result })
    else next({ message: '비정상적인 접근입니다.' })
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

// 비밀번호 재설정
router.post('/changepw', async function (req, res, next) {
  try {
    const result = await User.findOne({ authcode: req.query.authcode })
    await result.setPassword(req.body.newpassword)
    result.authcode = ''
    await result.save()
    res.redirect('/')
  } catch (error) {
    console.log(error)
    next({ message: '알 수 없는 오류가 발생했습니다.' })
  }
})

module.exports = router
