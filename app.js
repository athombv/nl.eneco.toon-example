'use strict';

const Homey = require('homey');
// eslint-disable-next-line no-unused-vars
const { Log } = require('homey-log');
const { OAuth2App, OAuth2Util } = require('homey-oauth2app');

const ToonOAuth2Client = require('./lib/ToonOAuth2Client');

const TOON_DRIVER_NAME = 'toon';

class ToonApp extends OAuth2App {

  async onOAuth2Init() {
    this.enableOAuth2Debug();
    this.setOAuth2Config({
      client: ToonOAuth2Client,
      clientId: Homey.env.TOON_KEY,
      clientSecret: Homey.env.TOON_SECRET,
      apiUrl: 'https://api.toon.eu/toon/v3/',
      tokenUrl: 'https://api.toon.eu/token',
      authorizationUrl: 'https://api.toon.eu/authorize',
    });
    this.homeyLog = new Log({ homey: this.homey });
    this.log(`${this.id} running...`);
  }

  getToonDevicesByCommonName(commonName) {
    return this.ToonDriver
      .getDevices()
      .filter(device => device.getData().id === commonName);
  }

  get ToonDriver() {
    return this.homey.drivers.getDriver(TOON_DRIVER_NAME);
  }

  async isAuthenticated() {
    try {
      const session = await this._getSession();
      this.log(`isAuthenticated() -> ${!!session}`);
      return !!session;
    } catch (err) {
      this.error('isAuthenticated() -> could not get current session:', err);
      throw new Error('Could not get current OAuth2 session');
    }
  }

  async login() {
    this.log('login()');

    // Try get first saved client
    let client;
    try {
      client = this.getFirstSavedOAuth2Client();
    } catch (err) {
      this.log('login() -> no existing OAuth2 client available');
    }

    // Create new client since first saved was not found
    if (!client || client instanceof Error) {
      client = this.createOAuth2Client({ sessionId: OAuth2Util.getRandomId() });
    }

    this.log('login() -> created new temporary OAuth2 client');

    // Start OAuth2 process
    const apiUrl = client.getAuthorizationUrl();
    const oauth2Callback = await this.homey.cloud.createOAuth2Callback(apiUrl);
    oauth2Callback.on('url', url => this.homey.api.realtime('url', url))
      .on('code', async code => {
        this.log('login() -> received OAuth2 code');
        try {
          await client.getTokenByCode({ code });
        } catch (err) {
          this.error('login() -> could not get token by code', err);
          this.homey.api.realtime('error', new Error(this.homey.__('authentication.re-login_failed_with_error', { error: err.message || err.toString() })));
        }
        // get the client's session info
        const session = await client.onGetOAuth2SessionInformation();
        const token = client.getToken();
        const { title } = session;
        client.destroy();

        try {
          // replace the temporary client by the final one and save it
          client = this.createOAuth2Client({ sessionId: session.id });
          client.setTitle({ title });
          client.setToken({ token });
          client.save();
        } catch (err) {
          this.error('Could not create new OAuth2 client', err);
          this.homey.api.realtime('error', new Error(this.homey.__('authentication.re-login_failed_with_error', { error: err.message || err.toString() })));
        }

        this.log('login() -> authenticated');
        this.homey.api.realtime('authorized');

        // Get Toon devices and call resetOAuth2Client on device to re-bind a new OAuth2Client
        // instance to the device
        try {
          await this.ToonDriver
            .getDevices()
            .forEach(toonDevice => toonDevice.resetOAuth2Client({
              sessionId: session.id,
              configId: this.ToonDriver.getOAuth2ConfigId(),
            }));
        } catch (err) {
          this.error('Could not reset OAuth2 client on Toon device instance', err);
          this.homey.api.realtime('error', new Error(this.homey.__('authentication.re-login_failed_with_error', { error: err.message || err.toString() })));
        }
        this.log('login() -> reset devices to new OAuth2 client');
      })
      .generate();
  }

  async logout() {
    this.log('logout()');
    const session = await this._getSession();
    const sessionId = Object.keys(session)[0];
    this.deleteOAuth2Client({ sessionId, configId: session.configId });

    // Get Toon devices and mark as unavailable
    return Promise.all(
      this.ToonDriver
        .getDevices()
        .map(toonDevice => toonDevice.setUnavailable()),
    );
  }

  async _getSession() {
    let sessions = null;
    try {
      sessions = this.getSavedOAuth2Sessions();
    } catch (err) {
      this.error('isAuthenticated() -> error', err.message);
      throw err;
    }
    if (Object.keys(sessions).length > 1) {
      throw new Error('Multiple OAuth2 sessions found, not allowed.');
    }
    this.log('_getSession() ->', Object.keys(sessions).length === 1 ? Object.keys(sessions)[0] : 'no session found');
    return Object.keys(sessions).length === 1 ? sessions : null;
  }

}

module.exports = ToonApp;
