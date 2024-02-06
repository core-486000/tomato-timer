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

router.get('/', (req, res, next) => {
  res.render('timer', { user: req.user, cookies: req.cookies});
});

router.post('/update', (req, res, next) => {
  res
    .cookie('workTime', req.body.workTime, { expires: cookieExpires })
    .cookie('breakTime', req.body.breakTime, { expires: cookieExpires })
    .cookie('loop', req.body.loop, { expires: cookieExpires })
    .cookie('lastBreakTime', req.body.lastBreakTime, { expires: cookieExpires })
    .redirect('/');
});

module.exports = router;