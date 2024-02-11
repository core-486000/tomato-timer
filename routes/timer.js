'use strict';
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [ 'query' ] });

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
  // CookieとDBに保存するタイマー時間のバリデーション
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

  const workTime = parseInt(req.body.workTime);
  const breakTime = parseInt(req.body.breakTime);
  const loop = parseInt(req.body.loop);
  const lastBreakTime = parseInt(req.body.lastBreakTime);

  if (req.isAuthenticated()) {
    const userId = parseInt(req.user.id);
    const data = {
      userId,
      workTime,
      breakTime,
      loop,
      lastBreakTime
    };
    await prisma.time.upsert({
      where: { userId },
      update: data,
      create: data
    });
  }

  res
    .cookie('workTime', workTime, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
    .cookie('breakTime', breakTime, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
    .cookie('loop', loop, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
    .cookie('lastBreakTime', lastBreakTime, { maxAge: 1000 * 60 * 60 * 24 * 365, secure: true })
    .redirect('/');
});

module.exports = router;