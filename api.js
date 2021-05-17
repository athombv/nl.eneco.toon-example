'use strict';

module.exports = {
  async getLogin({ homey }) {
    // Try to get the authenticated state
    try {
      return homey.app.isAuthenticated();
    } catch (err) {
      throw new Error(homey.__('api.error_get_authenticated_state', { error: err.message || err.toString() }));
    }
  },
  async postLogin({ homey, body = {} }) {
    if (typeof body.state !== 'boolean') {
      throw new Error('Body > State should be a boolean');
    }

    const shouldLogin = body.state;
    if (shouldLogin) {
      try {
        await homey.app.login();
        return true;
      } catch (err) {
        throw new Error(homey.__('api.error_login_failed', { error: err.message || err.toString() }));
      }
    }

    try {
      await homey.app.logout();
      return true;
    } catch (err) {
      throw new Error(homey.__('api.error_logout_failed', { error: err.message || err.toString() }));
    }
  },
};
