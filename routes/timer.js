'use strict';
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('timer', { user: req.user });
});

module.exports = router;