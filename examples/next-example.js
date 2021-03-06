const express = require('express');
const passport = require('passport');
const next = require('next');
const session = require('express-session');
const cookieSession = require('cookie-session');
const ControlTowerStrategy = require('passport-control-tower');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const { parse } = require('url');
const routes = require('./routes');

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';

// Next app creation
const app = next({ dev });
const handle = routes.getRequestHandler(app);

// Express app creation
const server = express();

function isAuthenticated(req, res, nextAction) {
  if (req.isAuthenticated()) return nextAction();
  // if they aren't redirect them to the home page
  res.redirect('/');
}
// Use the Control Tower Strategy within Passport.
const controlTowerStrategy = new ControlTowerStrategy({
  controlTowerUrl: '[CONTROL_TOWER_API_URL]',
  callbackUrl: '[YOUR_CALLBACK_URL]' // auth path
});
passport.use(controlTowerStrategy);

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
server.use(cookieSession({
  name: 'session',
  keys: [process.env.SECRET || 'keyboard cat']
}));
server.use(session({
  secret: process.env.SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
server.use(passport.initialize());
server.use(passport.session());

// Initializing next app before express server
app.prepare()
  .then(() => {
    // Public/landing page
    server.get('/', function (req, res) {
      return app.render(req, res, '/landing');
    });

    server.get('/login', function(req, res) {
      controlTowerStrategy.login(req, res);
    });

    server.get('/logout', function (req, res) {
      req.logout();
      res.redirect('/');
    });

    server.get('/auth', passport.authenticate('control-tower', { failureRedirect: '/' }), function (req, res) {
      res.redirect('/admin');
    });

    server.get('/admin', isAuthenticated, function (req, res) {
      const parsedUrl = parse(req.url, true);
      return handle(req, res, parsedUrl);
    });

    server.use(handle);

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  });
