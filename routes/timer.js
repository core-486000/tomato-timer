'use strict';
const express = require('express');
const router = express.Router();

const { body, validationResult } = require('express-validator');

router.get('/', (req, res, next) => {
  if (req.cookies.workTime && req.cookies.breakTime && req.cookies.loop && req.cookies.lastBreakTime) {
    res
      .cookie('workTime', req.cookies.workTime, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
      .cookie('breakTime', req.cookies.breakTime, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
      .cookie('loop', req.cookies.loop, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
      .cookie('lastBreakTime', req.cookies.lastBreakTime, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true });
  }
  
  res.render('timer', { 
    user: req.user
  });
});

router.get('/edit', (req, res, next) => {
  res.render('edit', { 
    cookies: req.cookies,
    csrfToken: req.csrfToken()
  });
});

router.post('/update', async (req, res, next) => {
  // Cookieに保存するデータのバリデーション
  await body('workTime').isInt({ min: 1, max: 99 }).run(req);
  await body('breakTime').isInt({ min: 1, max: 99 }).run(req);
  await body('loop').isInt({ min: 1, max: 10 }).run(req);
  await body('lastBreakTime').isInt({ min: 1, max: 99 }).run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error('入力された情報が不十分または正しくありません。');
    err.status = 400;
    return next(err);
  }

  res
    .cookie('workTime', req.body.workTime, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
    .cookie('breakTime', req.body.breakTime, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
    .cookie('loop', req.body.loop, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
    .cookie('lastBreakTime', req.body.lastBreakTime, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
    .redirect('/');
});

module.exports = router;