const request = require('superagent');
const passport = require('passport-strategy');
const util = require('util');

function Strategy(options = {}) {
  this.name = 'control-tower';
  if (!options.apiUrl) throw new TypeError('apiUrl param is required');
  if (!options.callbackUrl) throw new TypeError('callbackUrl param is required');
  passport.Strategy.call(this);
  this.apiUrl = options.apiUrl;
  this.callbackUrl = options.callbackUrl;
}

// Inherits from Passport Strategy
util.inherits(Strategy, passport.Strategy);

/**
 * Authentication method
 */
Strategy.prototype.authenticate = function authenticate(req) {
  passport.Strategy.call(this);
  if (!req.isAuthenticated() && !req.query.token) {
    this.redirect(`${this.apiUrl}/auth?callbackUrl=${this.callbackUrl}&token=true`);
  } else {
    this.verify({ token: req.query.token }, (err, user, info) => {
      if (err) return this.error(err);
      if (!user) return this.fail(info);
      return this.success(user, info);
    });
  }
};

/**
 * Verify using Control Tower gateway
 */
Strategy.prototype.verify = function verify(user, done) {
  request(`${this.apiUrl}/auth/check-logged`)
    .set('Authorization', `Bearer ${user.token}`)
    .end((err, res) => {
      if (err) {
        done(err, null, 'User unathorized');
      } else {
        done(null, res.body, 'User authenticated correctly');
      }
    });
};

Strategy.prototype.error = function error(err) {
  throw err || 'An error happened';
};

module.exports = Strategy;
