const axios = require('axios');
require('dotenv').config()

const getContacts = async (token, contacts, email, next) => {
    try {
        let url = `https://api.infusionsoft.com/crm/rest/v1/contacts?order=date_created&order_direction=descending`
        if (next) {
            url = `${next}`
        }
        const res = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`, 'Accept': "application/json, */*"
            }
        })
        for (let i = 0; i < res.data.contacts.length; i++) {
            for (let j = 0; j < res.data.contacts[i].email_addresses.length; i++) {
                if (res.data.contacts[i].email_addresses[j].email === email) {
                    return res.data.contacts[i]
                }
            }
        }
        // console.log(res.data);
        // console.log(res.data.contacts[0]);
        return
    } catch (e) {
        console.log(e);
    }
}
const getContact = async (token, email) => {
    try {
        const res = await axios.get(`https://api.infusionsoft.com/crm/rest/v1/contacts?email=${email}`, {
            headers: {
                'Authorization': `Bearer ${token}`, 'Accept': "application/json, */*"
            }
        })
        // console.log(res.data);
        // console.log(res.data.contacts[0]);
        return res.data
    } catch (e) {
        console.log(e);
    }
}
const getContactModel = async (token) => {
    try {
        const res = await axios.get(`https://api.infusionsoft.com/crm/rest/v1/contacts/model`, {
            headers: {
                'Authorization': `Bearer ${token}`, 'Accept': "application/json, */*"
            }
        })
        // console.log(res.data);
        // console.log(res.data.contacts[0]);
        return res.data
    } catch (e) {
        console.log(e);
    }
}
const playground = async () => {
    try {
        const oldTokenData = await getCredential()
        const oldRefreshToken = oldTokenData[0].refresh_token
        const data = `grant_type=refresh_token&refresh_token=${oldRefreshToken}`
        const base64encoded = Buffer.from(`${process.env.KEAP_API_KEY}:${process.env.KEAP_SECRET}`).toString('base64')
        const resData = await axios.post(`https://api.infusionsoft.com/token`, data, { headers: { 'Authorization': `Basic ${base64encoded}`, 'content-type': 'application/x-www-form-urlencoded' } })
        const access_token = resData.data.access_token
        const refresh_token = resData.data.refresh_token
        await updateCredential(oldTokenData[0]._id, {
            access_token,
            refresh_token
        })
        setTimeout(async () => {
            const contact = await getContact(access_token, 'starlove00168@gmail.com')
            // const contact = await getContactModel(access_token)
            console.log("FOUND", contact);
            if (contact && contact.length > 0) {
                postUrl = `https://api.infusionsoft.com/crm/xmlrpc/v1?access_token=`
            }
        }, 10000)
    } catch (e) {
        console.log(e);
    }
}

// playground()

module.exports = {getContact}