const request = require('superagent');
const passport = require('passport-strategy');
const util = require('util');

function Strategy(options = {}) {
  this.name = 'control-tower';
  if (!options.controlTowerUrl) throw new TypeError('Control Tower URL (controlTowerUrl) param is required');
  if (!options.callbackUrl) throw new TypeError('callbackUrl param is required');
  passport.Strategy.call(this);
  this.controlTowerUrl = options.controlTowerUrl;
  this.callbackUrl = options.callbackUrl;
}

// Inherits from Passport Strategy
util.inherits(Strategy, passport.Strategy);

function reqParamFromQuery(paramName, request) {
  let token = null;
  if (request.query && Object.prototype.hasOwnProperty.call(request.query, paramName)) {
    token = request.query[paramName];
  }
  return token;
}

/**
 * Authentication method
 */
Strategy.prototype.authenticate = function authenticate(req) {
  const self = this;
  const token = reqParamFromQuery('token', req);

  if (!token) {
    return self.fail(new Error('No auth token'));
  }

  // Save token in session

  const verified = function(err, user, info) {
    if (err) {
      return self.error(err);
    }
    if (!user) {
      return self.fail(info);
    }
    return self.success(user, info);
  };

  try {
    self.verify(token, verified);
  } catch(ex) {
    self.error(ex);
  }
};

/**
 * Verify using Control Tower gateway
 */
Strategy.prototype.verify = function verify(token, done) {
  request(`${this.controlTowerUrl}/auth/check-logged`)
    .set('Authorization', `Bearer ${token}`)
    .end((err, res) => {
      if (err) {
        done(err, null, 'User unathorized');
      } else {
        const user = Object.assign({}, res.body, { token: token });
        done(null, user, 'User authenticated correctly');
      }
    });
};

Strategy.prototype.login = function(req, res) {
  res.redirect(`${this.controlTowerUrl}/auth?callbackUrl=${this.callbackUrl}&token=true`);
};

Strategy.prototype.error = function error(err) {
  throw err || 'An error happened';
};

module.exports = Strategy;
