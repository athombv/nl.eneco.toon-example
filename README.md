
### Toon by Eneco app for Homey

This repository serves as inspiration for your own Homey app, to help you understand Homey Apps SDK concepts in a real-life context.

Read the [Homey Apps SDK Documentation](https://apps.developer.homey.app) for more information about developing apps for Homey.

> Because this repository is a clone of the live code, pull requests will be ignored.

## What does this app do?

This app uses [`homey-oauth2app`](https://athombv.github.io/node-homey-oauth2app/) to control Toon devices using the Toon API. Read more about OAuth 2.0 for your Homey App: https://apps.developer.homey.app/cloud/oauth2.

**Note:** Currently the Toon API poses some limitations: gas measurement events are not pushed to Homey and only one Toon can be installed on a Homey at a time. We are waiting for these features to be implemented by Toon API.
