const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const csurf = require('tiny-csrf');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [ 'query' ] });
const favicon = require('serve-favicon');
require('dotenv').config();

const GitHubStrategy = require('passport-github2').Strategy;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || 'http://localhost:8000/auth/github/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    process.nextTick(async () => {
      const userId = parseInt(profile.id);

      const data = {
        userId,
        username: profile.username
      }

      await prisma.user.upsert({
        where: { userId },
        create: data,
        update: data
      });

      return done(null, profile);
    });
  }
));

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const timerRouter = require('./routes/timer');

const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      "script-src": ["'self'",
      "https://code.jquery.com/jquery-3.7.1.min.js", 
      "https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
      "https://cdn.jsdelivr.net/npm/dayjs@1.11.10/",
      "https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js"],
      "style-src": ["'self'",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
      "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"]
    }
  }
}));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('core486000_signed_cookies'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'b03d80667d932699', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(
  csurf(
    'core486000secretsecret9876543212',
    ['POST']
  )
);

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/timer', timerRouter);

app.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })  
);

app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/timer');
  }
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
