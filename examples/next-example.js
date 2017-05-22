const express = require('express');
const passport = require('passport');
const ControlTowerStrategy = require('passport-control-tower');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { parse } = require('url');
const routes = require('./routes');

// Next app creation
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = routes.getRequestHandler(app);

// Express app creation
const server = express();

function isAuthenticated(req, res, nextAction) {
  if (req.isAuthenticated()) return nextAction();
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
server.use(cookieParser());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
server.use(passport.initialize());
server.use(passport.session());

// Public/landing page
server.get('/', function (req, res) {
  const { query } = parse(req.url, true);
  app.render(req, res, '/landing', query);
});

server.get('/login', passport.authenticate('control-tower'), function (req, res) {
  // Success
  res.redirect('/admin');
});

server.get('/logout', function (req, res) {
  req.session.destroy();
  req.logout();
  // Success
  res.redirect('/');
});

server.get('/admin(/*)', isAuthenticated, function (req, res) {
  const parsedUrl = parse(req.url, true);
  handle(req, res, parsedUrl);
});

server.listen(3000);
