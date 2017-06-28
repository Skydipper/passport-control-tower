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

function reqParamFromQuery(paramName, req) {
  let token = null;
  if (req.query && Object.prototype.hasOwnProperty.call(req.query, paramName)) {
    token = req.query[paramName];
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

  function verified(err, user, info) {
    if (err) {
      return self.error(err);
    }
    if (!user) {
      return self.fail(info);
    }
    return self.success(user, info);
  }

  try {
    return self.verify(token, verified);
  } catch (ex) {
    return self.error(ex);
  }
};

/**
 * Verify using Control Tower gateway
 */
Strategy.prototype.verify = function verify(userToken, done) {
  request(`${this.controlTowerUrl}/auth/check-logged`)
    .set('Authorization', `Bearer ${userToken}`)
    .end((err, res) => {
      if (err) {
        done(err, null, 'User unathorized');
      } else {
        const user = Object.assign({}, res.body, { token: userToken });
        done(null, user, 'User authenticated correctly');
      }
    });
};

Strategy.prototype.login = function login(req, res) {
  res.redirect(`${this.controlTowerUrl}/auth?callbackUrl=${this.callbackUrl}&token=true`);
};

Strategy.prototype.error = function error(err) {
  throw err || 'An error happened';
};

module.exports = Strategy;
