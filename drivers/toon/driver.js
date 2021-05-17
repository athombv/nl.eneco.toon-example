'use strict';

const { OAuth2Driver } = require('homey-oauth2app');
const ToonDevice = require('./device.js');

class ToonDriver extends OAuth2Driver {

  onOAuth2Init() {
    this.log('onOAuth2Init()');
    super.onOAuth2Init();

    const temperatureStateIsCondition = this.homey.flow.getConditionCard('temperature_state_is');
    temperatureStateIsCondition.registerRunListener(args => args.device.getCapabilityValue('temperature_state') === args.state);

    const setTemperatureStateAction = this.homey.flow.getActionCard('set_temperature_state');
    setTemperatureStateAction.registerRunListener(args => args.device.onCapabilityTemperatureState(args.state, (args.resume_program === 'yes')));

    const enableProgramAction = this.homey.flow.getActionCard('enable_program');
    enableProgramAction.registerRunListener(args => args.device.enableProgram());

    const disableProgramAction = this.homey.flow.getActionCard('disable_program');
    disableProgramAction.registerRunListener(args => args.device.disableProgram());

    this.log('onOAuth2Init() -> success');
  }

  /**
   * The method will be called during pairing when a list of devices is needed. Only when this class
   * extends WifiDriver and provides a oauth2ClientConfig onInit. The data parameter contains an
   * temporary OAuth2 account that can be used to fetch the devices from the users account.
   * @returns {Promise}
   */
  async onPairListDevices({ oAuth2Client }) {
    this.log('onPairListDevices()');
    let agreements;
    try {
      agreements = await oAuth2Client.getAgreements();
    } catch (err) {
      this.error('onPairListDevices() -> error, failed to get agreements, reason:', err.message);
      throw new Error(this.homey.__('pairing.agreement_error'));
    }
    this.log(`onPairListDevices() -> got ${agreements.length} agreements`);
    if (Array.isArray(agreements)) {
      return agreements.map(agreement => ({
        name: (agreements.length > 1) ? `Toon: ${agreement.street} ${agreement.houseNumber} , ${agreement.postalCode} ${agreement.city.charAt(0)}${agreement.city.slice(1).toLowerCase()}` : 'Toon',
        data: {
          id: agreement.displayCommonName,
          agreementId: agreement.agreementId,
        },
        store: {
          apiVersion: 3,
        },
      }));
    }
    return [];
  }

  /**
   * Always use ToonDevice as device for this driver.
   * @returns {ToonDevice}
   */
  mapDeviceClass() {
    return ToonDevice;
  }

}

module.exports = ToonDriver;
