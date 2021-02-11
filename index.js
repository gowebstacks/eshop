const express = require('express')
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config()
const mongoose = require('mongoose')
const { getCredential, addCredential, updateCredential } = require('./db')

const app = express()
app.use(bodyParser.json())

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

app.get("/", (req, res) => {
    res.send(JSON.stringify({ "Hello": "World" }))
});

app.get('/authorize', async (req, res) => {
    let authUri = `https://accounts.infusionsoft.com/app/oauth/authorize?client_id=${process.env.KEAP_API_KEY}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=full`
    res.redirect(authUri);
})

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
                access_token: authResponse.token.access_token,
                refresh_token: authResponse.token.refresh_token,
                createdAt: authResponse.token.createdAt
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

const playground = async () => {
    const oldTokenData = await getCredential()
    const oldRefreshToken = oldTokenData[0].refresh_token
    const data = `grant_type=refresh_token&refresh_token=${oldRefreshToken}`
    const base64encoded = Buffer.from(`${process.env.KEAP_API_KEY}:${process.env.KEAP_SECRET}`).toString('base64')
    const resData = await axios.post(`https://api.infusionsoft.com/token`, data, { headers: { 'Authorization': `Basic ${base64encoded}`, 'content-type': 'application/x-www-form-urlencoded' } })
    console.log("REFRESH TOKEN  :)   ", resData);
    const access_token = resData.data.access_token
    const refresh_token = resData.data.refresh_token
    await updateCredential(cred[0]._id, {
        access_token,
        refresh_token
    })
}

// playground()

app.post('/click_funnels', async (req, res) => {
    const oldTokenData = await getCredential()
    const oldRefreshToken = oldTokenData[0].refresh_token
    const data = `grant_type=refresh_token&refresh_token=${oldRefreshToken}`
    const base64encoded = Buffer.from(`${process.env.KEAP_API_KEY}:${process.env.KEAP_SECRET}`).toString('base64')
    const resData = await axios.post(`https://api.infusionsoft.com/token`, data, { headers: { 'Authorization': `Basic ${base64encoded}`, 'content-type': 'application/x-www-form-urlencoded' } })
    console.log("REFRESH TOKEN  :)   ", resData);
    const access_token = resData.data.access_token
    const refresh_token = resData.data.refresh_token
    await updateCredential(cred[0]._id, {
        access_token,
        refresh_token
    })


    // const purchase = req.body.purchase

    // if (purchase) {
    //     try {
    //         let userId = await getUserVID(email)

    //         if (!userId) {
    //             userId = await createUserOptIn(email, firstName, lastName, true)
    //         } else {
    //             // update contacts's opt in if they selected it
    //             updateContact(userId)
    //         }
    //     } catch (e) {
    //         console.log("ERROR", e);
    //     }
    // }
    res.status(200).send()
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
