'use strict';
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [ 'query' ] });

const { body, validationResult } = require('express-validator');

router.get('/', (req, res, next) => {
  const workTime = req.cookies.workTime;
  const breakTime = req.cookies.breakTime;
  const loop = req.cookies.loop;
  const lastBreakTime = req.cookies.lastBreakTimeTime;

  if (workTime && breakTime && loop && lastBreakTime) {
    res
      .cookie('workTime', workTime, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
      .cookie('breakTime', breakTime, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
      .cookie('loop', loop, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
      .cookie('lastBreakTime', lastBreakTime, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true });
  }
  
  res.render('timer', { 
    user: req.user,
    cookies: req.cookies,
    csrfToken: req.csrfToken()
  });
});

// タイマー時間をCookieに保存
router.post('/update', async (req, res, next) => {
  await body('work_time').isInt({ min: 1, max: 99 }).run(req);
  await body('break_time').isInt({ min: 1, max: 99 }).run(req);
  await body('loop').isInt({ min: 1, max: 10 }).run(req);
  await body('last_break_time').isInt({ min: 1, max: 99 }).run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error('入力された情報が不十分または正しくありません。');
    err.status = 400;
    return next(err);
  }

  res
    .cookie('workTime', req.body.work_time, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
    .cookie('breakTime', req.body.break_time, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
    .cookie('loop', req.body.loop, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
    .cookie('lastBreakTime', req.body.last_break_time, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
    .redirect('/timer');
});

router.get('/elapsed-work-times', async (req, res, next) => {
  const userId = parseInt(req.user.id);
  const elapsedWorkTimeJson = req.cookies.elapsedWorkTimeJson;
  const data = { userId, elapsedWorkTimeJson };
  await prisma.TimerRecord.upsert({
    where: { userId },
    create: data,
    update: data
  });
  res.send();
});

module.exports = router;