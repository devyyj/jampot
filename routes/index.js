var express = require('express');
var passport = require('passport');
var router = express.Router();
let board = require('../models/board');
var Account = require('../models/account');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

/* GET home page. */
router.get('/', function (req, res, next) {
  board.find().sort({ postNumber: -1 }).exec(function (err, result) {
    if (err) {
      res.render(err);
    } else {
      res.render('index', { data: result, user: req.user, moment: moment });
    }
  })
});

router.get('/createPost', function (req, res) {
  if (req.user == undefined) {
    res.redirect('/login')
  } else {
    res.render('createPost', { data: {} });
  }
});

router.post('/createPost', function (req, res) {
  if (req.query.postNumber != "undefined") {
    board.updateOne({ postNumber: req.query.postNumber }, {
      title: req.body.title,
      content: req.body.content
    }, function (err, result) {
      if (err) {
        res.render(err);
      } else {
        console.log(result);
        res.redirect('/')
      }
    })
  } else {
    let post = new board({
      user: req.user.username,
      title: req.body.title,
      content: req.body.content
    });

    post.save(function (err, result) {
      if (err) {
        res.render(err);
      } else {
        res.redirect('/readPost?postNumber=' + result.postNumber)
      }
    });
  }
});

router.get('/readPost', function (req, res) {
  board.findOne({ postNumber: req.query.postNumber }, function (err, result) {
    if (err) {
      res.render(err);
    } else {
      res.render('readPost', { data: result, moment: moment });
    }
  });
});

router.get('/updatePost', function (req, res) {
  if (req.user == undefined) {
    res.redirect('/login')
  } else {
    board.findOne({ postNumber: req.query.postNumber }, function (err, result) {
      if (err) {
        res.render(err);
      } else {
        if (result.user != req.user.username) {
          res.render('warning');
        } else {
          res.render('createPost', { data: result });
        }
      }
    });
  }
})

router.get('/deletePost', function (req, res) {
  if (req.user == undefined) {
    res.redirect('/login')
  } else {
    board.findOne({ postNumber: req.query.postNumber }, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        if (result.user != req.user.username) {
          res.render('warning');
        } else {
          result.delete({ postNumber: req.query.postNumber });
          res.redirect('/')
        }
      }
    })
  }
})

// passport
router.get('/register', function (req, res) {
  res.render('register', {});
});

router.post('/register', function (req, res) {
  Account.register(new Account({ username: req.body.username }), req.body.password, function (err, account) {
    if (err) {
      return res.render('register', { account: account });
    }

    passport.authenticate('local')(req, res, function () {
      res.redirect('/');
    });
  });
});

router.get('/login', function (req, res) {
  req.session.backURL = req.header('Referer');
  res.render('login');
});

router.post('/login', passport.authenticate('local'), function (req, res) {
  let backURL = req.session.backURL || '/';
  delete req.session.backURL;
  res.redirect(backURL);
});

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/ping', function (req, res) {
  res.status(200).send("pong!");
});

module.exports = router;
