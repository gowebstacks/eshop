const express = require('express')
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config()
const cors = require('cors')
const mongoose = require('mongoose')
const { Notifier } = require('@airbrake/node');

const { getCredential, addCredential, updateCredential } = require('./db')
const { getContact, updateContact } = require('./utils')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const PORT = process.env.PORT || 3000

mongoose.connect(process.env.CONNECT_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const connection = mongoose.connection;
connection.once('open', async () => {
    console.log("MongoDB connection successful.");
})

const airbrake = new Notifier({
    projectId: 326711,
    projectKey: 'a314d6e15984325310a0a11fe8e956fd',
    environment: 'production'
})

app.get("/", (req, res) => {
    res.send(JSON.stringify({ "Hello": "World" }))
});

// INITIAL ENDPOINT TO TRIGGER OAUTH PROCESS - OPEN IN BROWSER
app.get('/authorize', async (req, res) => {
    let authUri = `https://accounts.infusionsoft.com/app/oauth/authorize?client_id=${process.env.KEAP_API_KEY}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=full`
    res.redirect(authUri);
})

// THE ENDPOINT THE OAUTH PROCESS WILL HIT WITH THE ACCESS CODE
app.get('/callback', async (req, res) => {
    const code = req.query.code
    try {
        const data = `client_id=${process.env.KEAP_API_KEY}&client_secret=${process.env.KEAP_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${process.env.REDIRECT_URI}`
        const resData = await axios.post(`https://api.infusionsoft.com/token`, data, { headers: { 'content-type': 'application/x-www-form-urlencoded' } })
        const access_token = resData.data.access_token
        const refresh_token = resData.data.refresh_token
       
        const cred = await getCredential()
        if (cred.length > 0) {
            await updateCredential(cred[0]._id, {
                access_token: access_token,
                refresh_token: refresh_token,
            })
        } else {
            const newCreds = await addCredential({
                access_token,
                refresh_token
            })
        }
        res.status(200).send()
    } catch (e) {
        console.log(e);
    }
})

const sleep = (ms) => {
    return new Promise((resolve) => {
        console.log("waiting for Keap to create contact");
        setTimeout(resolve, ms)
    })
}

app.post('/funnelData', async (req, res) => {
    // INCOMING CONTACT DATA FROM WEB FORM ON CLICKFUNNELS
    console.log("REQ", req.body);
    const email = req.body.fields[0].value
    const password = req.body.fields[1].value
    console.log("EMAIL", email, '\n', 'PASSWORD', password);

    try {
        if (email) {
            // DELAY TO WAIT FOR INFUSIONSOFT TO FINISH CREATING/UPDATING CONTACT RECORD BEFORE LOOKING FOR CONTACT BY EMAIL VIA WEB FORM EMAIL VALUE
            await sleep(6000)
            // RETRIEVE KEAP ACCESS TOKEN + REFRESH TOKEN FROM DB 
            const oldTokenData = await getCredential()
            const oldRefreshToken = oldTokenData[0].refresh_token
            const data = `grant_type=refresh_token&refresh_token=${oldRefreshToken}`
            const base64encoded = Buffer.from(`${process.env.KEAP_API_KEY}:${process.env.KEAP_SECRET}`).toString('base64')
            // USE OLD TOKENS TO GET NEW TOKENS AND UPDATE THE TOKENS IN DB
            const resData = await axios.post(`https://api.infusionsoft.com/token`, data, { headers: { 'Authorization': `Basic ${base64encoded}`, 'content-type': 'application/x-www-form-urlencoded' } })
            const access_token = resData.data.access_token
            const refresh_token = resData.data.refresh_token
            console.log('LATEST REFRESH:', refresh_token);
            await updateCredential(oldTokenData[0]._id, {
                access_token,
                refresh_token
            })
            let contactId = await getContact(access_token, email)
            if (contactId) {
                console.log("CONTACT", contactId);
                updateContact(access_token, contactId, password)
            }
        }
    } catch (e) {
        try {
            if (email) {
                // DELAY TO WAIT FOR INFUSIONSOFT TO FINISH CREATING/UPDATING CONTACT RECORD BEFORE LOOKING FOR CONTACT BY EMAIL VIA WEB FORM EMAIL VALUE
                await sleep(6000)
                // RETRIEVE KEAP ACCESS TOKEN + REFRESH TOKEN FROM DB 
                const oldTokenData = await getCredential()
                const oldRefreshToken = oldTokenData[0].refresh_token
                const data = `grant_type=refresh_token&refresh_token=${oldRefreshToken}`
                const base64encoded = Buffer.from(`${process.env.KEAP_API_KEY}:${process.env.KEAP_SECRET}`).toString('base64')
                // USE OLD TOKENS TO GET NEW TOKENS AND UPDATE THE TOKENS IN DB
                const resData = await axios.post(`https://api.infusionsoft.com/token`, data, { headers: { 'Authorization': `Basic ${base64encoded}`, 'content-type': 'application/x-www-form-urlencoded' } })
                const access_token = resData.data.access_token
                const refresh_token = resData.data.refresh_token
                console.log('LATEST REFRESH:', refresh_token);
                await updateCredential(oldTokenData[0]._id, {
                    access_token,
                    refresh_token
                })
                let contactId = await getContact(access_token, email)
                if (contactId) {
                    console.log("CONTACT", contactId);
                    updateContact(access_token, contactId, password)
                }
            }
        } catch (e) {
            console.log(e);
            airbrake.notify(e)
        }
    }
    res.status(200).send()
})

// ENDPOINT TO ENABLE CLICKFUNNEL ENDPOINTS
app.post('/funnel_webhooks/test', async (req, res) => {
    console.log(req);
    res.status(200).send()
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
