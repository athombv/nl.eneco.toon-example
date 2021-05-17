
### Toon by Eneco app for Homey

This repository serves as inspiration for your own Homey app, to help you understand Homey Apps SDK concepts in a real-life context.

Read the [Homey Apps SDK Documentation](https://apps.developer.homey.app) for more information about developing apps for Homey.

> Because this repository is a clone of the live code, pull requests will be ignored.

## What does this app do?

This app enables Homey to control your Toon! Supported features are: setting the target temperature, reading the room temperature and displaying your electricity usage in Insights!

This is achieved by using the Toon API and the [CreateOauth2Callback](https://apps-sdk-v3.developer.homey.app/ManagerCloud.html#createOAuth2Callback) function.
Read more about Oauth2 for your Homey App: https://apps.developer.homey.app/cloud/oauth2

NOTE: Currently the Toon API poses some limitations, gas measurement events are not pushed to Homey and only one Toon can be installed on a Homey at a time. We are waiting for these features to be implemented by Toon API.
DISCLAIMER: This application uses the Toon API but has not been developed, certified or otherwise approved on behalf of or on the instructions of Toon.
