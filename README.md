# ESHOP CLICKFUNNELS-KEAP/INFUSION SOFT INTEGRATION

## About the Integration

The integration connects ClickFunnels forms to Infusion Soft by a custom Javascript module/element that lives on the ClickFunnels form. The Javascript can be copied and pasted into other JS modules on other forms to achieve the same effect, which is to POST the form data to this web app, which parses the data for the password and email properties. Before moving on to the interaction with Keap, the webapp has to first fetch and update its access token. The credentials are stored in MongoDb - each time the app is triggered, it will use the refresh token that is returned from the DB to update the credentials in Keap and save the new creds in the DB. The app then uses the access token from the previous step and the email that was returned from the ClickFunnels form to lookup contacts in Keap with the same email. If one exists, the app will update the contact record's access code property with the password sent from the ClickFunnels form.

One caveat / concern is if/when the refresh token gets 'out of sync' with Keap's last sent refresh token. Perhaps the connection is interrupted or the app fails for an unexpected reason and the last saved refresh token in the db does not match that in Keap's records. To resolve this, a developer will have to manually reinstall the Keap app on the Keap account by opening the following link: 'https://eshop-integration.herokuapp.com/authorize'
The page will walk you through installation directions. The app will output (console.log) the credentials from the interaction which then have to get manually saved to the record in MongoDb to 're-sync- the app's credentials with Keap. 

## Installation

Sample:

Run npm install to install the dependencies. 
If running locally, you will need to provide the following environment variables:
    -KEAP_APP_ID
    -KEAP_API_KEY
    -KEAP_SECRET
    -REDIRECT_URI
    -DEV_REDIRECT_URI
    -CONNECT_URI
Otherwise, the hosted app contains the env variables, and updates can be posted directly to the heroku app.

## Code


### Deploy (how to install build product)

The app is hosted on Heroku. To update, simply run git push heroku master to push any local code modifications to the hosted version.
