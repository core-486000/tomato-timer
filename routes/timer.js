'use strict';
const express = require('express');
const router = express.Router();

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Tokyo');

const cookieExpires = dayjs().add(1, 'y').tz().toDate();
const { body, validationResult } = require('express-validator');

router.get('/', (req, res, next) => {
  res.render('timer', { 
    user: req.user,
    cookies: req.cookies,
    csrfToken: req.csrfToken()
  });
});

router.post('/update', async (req, res, next) => {
  await body('workTime').isInt({ min: 1, max: 59 }).run(req);
  await body('breakTime').isInt({ min: 1, max: 59 }).run(req);
  await body('loop').isInt({ min: 1, max: 10 }).run(req);
  await body('lastBreakTime').isInt({ min: 1, max: 59 }).run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error('入力された情報が不十分または正しくありません。');
    err.status = 400;
    return next(err);
  }

  res
    .cookie('workTime', req.body.workTime, { expires: cookieExpires, secure: true })
    .cookie('breakTime', req.body.breakTime, { expires: cookieExpires, secure: true })
    .cookie('loop', req.body.loop, { expires: cookieExpires, secure: true })
    .cookie('lastBreakTime', req.body.lastBreakTime, { expires: cookieExpires, secure: true })
    .redirect('/');
});

module.exports = router;