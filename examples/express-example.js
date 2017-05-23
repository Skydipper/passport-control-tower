const express = require('express');
const passport = require('passport');
const ControlTowerStrategy = require('passport-control-tower');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  // if they aren't redirect them to the home page
  res.redirect('/login');
}

// Use the Control Tower Strategy within Passport.
passport.use(new ControlTowerStrategy({
  apiUrl: '[CONTROL_TOWER_API_URL]',
  callbackUrl: '[YOUR_CALLBACK_URL]'
}));

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session.
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// configure Express
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
  res.send('Welcome!');
});

app.get('/private', isAuthenticated, function (req, res) {
  res.send('Success!');
});

// This should be callback URL
app.get('/login', passport.authenticate('control-tower'), function (req, res) {
  // Success
  res.redirect('/private');
});

app.get('/logout', function (req, res) {
  req.session.destroy();
  req.logout();
  // Success
  res.redirect('/');
});

app.listen(3000);
