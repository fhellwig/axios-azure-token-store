const axios = require('axios');

const FIVE_MINUTES = 5 * 60 * 1000;
const UNAUTHORIZED = 401;
const PLEASE_LOGIN = 'Not authenticated. Please login.';
const CONTENT_TYPE = 'content-type';
const JSON_CONTENT = 'application/json';
const AUTH_SERVICE = { ME: '/.auth/me', REFRESH: '/.auth/refresh' };

class UnauthorizedError extends Error {
  constructor() {
    super(PLEASE_LOGIN);
    this.code = UNAUTHORIZED;
  }
}

class TokenStore {
  constructor() {
    this._tokens = null;
    this._expiry = null;
    this._client = axios.create({
      withCredentials: true
    });
  }

  getTokens() {
    if (this._tokens === null) {
      return this._me().then(_ => {
        return this._get();
      });
    } else {
      return this._get();
    }
  }

  findClaim(typ) {
    const values = findClaims(typ);
    return values.length > 0 ? values[0] : null;
  }

  findClaims(typ) {
    if (this._tokens === null) {
      throw new Error('You must call getTokens() before finding claims.');
    }
    const values = [];
    this._tokens.user_claims.forEach(claim => {
      if (claim.typ === typ) {
        values.push(claim.val);
      }
    });
    return values;
  }

  addInterceptor(client) {
    client.interceptors.request.use(config => {
      return this.getTokens().then(tokens => {
        config.headers = config.headers || {};
        config.headers['Authorization'] = 'Bearer ' + tokens.access_token;
        return config;
      });
    });
  }

  install(Vue) {
    Vue.prototype.$tokenStore = this;
  }

  _get() {
    if (Date.now() < this._expiry) {
      return Promise.resolve(this._tokens);
    } else {
      return this._refresh().then(_ => {
        return this._me();
      });
    }
  }

  _me() {
    return this._client
      .get(AUTH_SERVICE.ME)
      .then(response => {
        if (response.headers[CONTENT_TYPE].startsWith(JSON_CONTENT)) {
          this._tokens = response.data[0];
          this._expiry = new Date(this._tokens.expires_on).getTime() - FIVE_MINUTES;
          return this._tokens;
        } else {
          return Promise.reject(new UnauthorizedError());
        }
      })
      .catch(err => {
        if (err.response) {
          return Promise.reject(err);
        } else {
          return Promise.reject(new UnauthorizedError());
        }
      });
  }

  _refresh() {
    return this._client.get(AUTH_SERVICE.REFRESH).catch(err => {
      if (err.response) {
        return Promise.reject(err);
      } else {
        return Promise.reject(new UnauthorizedError());
      }
    });
  }
}

module.exports = new TokenStore();
