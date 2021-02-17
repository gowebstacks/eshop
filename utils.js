const axios = require('axios');
require('dotenv').config()
const { getCredential, addCredential, updateCredential } = require('./db')

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
        return
    } catch (e) {
        console.log(e);
    }
}

const getContact = async (token, email) => {
    try {
        const res = await axios.get(`https://api.infusionsoft.com/crm/rest/v1/contacts?email=${email}&custom_fields`, {
            headers: {
                'Authorization': `Bearer ${token}`, 'Accept': "application/json, */*"
            }
        })
        if (res.data && res.data.contacts && res.data.contacts.length > 0) {
            return res.data.contacts[0].id
        } else {
            return res.data
        }
    } catch (e) {
        console.log(e);
    }
}

const newGetContact = async (token, userId) => {
    try {
        const reqBody = {
            optional_properties: ['custom_fields']
        }
        const res = await axios.get(`https://api.infusionsoft.com/crm/rest/v1/contacts/${userId}?optional_properties=custom_fields`, {
            headers: {
                'Authorization': `Bearer ${token}`, 'Accept': "application/json, */*"
            }
        })
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
        console.log(res.data);
        return res.data
    } catch (e) {
        console.log(e);
    }
}

const createCustomField = async (token) => {
    const reqBody = {
        "field_type": "Text",
        "label": "Access Code",
    }
    const res = await axios.post(`https://api.infusionsoft.com/crm/rest/v1/contacts/model/customFields`, reqBody, {
        headers: {
            'Authorization': `Bearer ${token}`, 'Accept': "application/json, */*"
        }
    })
    console.log("RESPONSe", res.data);
}

const updateContact = async (token, contactId, password) => {
    try {
        const reqBody = {
            "custom_fields": [
                {
                    "content": password,
                    "id": 39
                }
            ],
        }
        const res = await axios.patch(`https://api.infusionsoft.com/crm/rest/v1/contacts/${contactId}`, reqBody, {
            headers: {
                'Authorization': `Bearer ${token}`, 'Accept': "application/json, */*"
            }
        })
        console.log("SUCCESSFULLY UPDATED CONTACT");
    } catch (e) {
        console.log(e);
    }
}

const playground = async () => {
    try {
        const oldTokenData = await getCredential()
        const oldRefreshToken = 'NFJvmAvikO9P9VGCGRon2VnGk912AdXS'
        // const oldRefreshToken = oldTokenData[0].refresh_token
        const data = `grant_type=refresh_token&refresh_token=${oldRefreshToken}`
        const base64encoded = Buffer.from(`${process.env.KEAP_API_KEY}:${process.env.KEAP_SECRET}`).toString('base64')
        const resData = await axios.post(`https://api.infusionsoft.com/token`, data, { headers: { 'Authorization': `Basic ${base64encoded}`, 'content-type': 'application/x-www-form-urlencoded' } })
        const access_token = resData.data.access_token
        const refresh_token = resData.data.refresh_token
        console.log("access token", access_token, '\n', "refresh token", refresh_token);
        await updateCredential(oldTokenData[0]._id, {
            access_token,
            refresh_token
        })
        //         getContactModel('rXOhlAvwVP26VmaKMl6bAo7RcFiL')
        //         // setTimeout(async () => {
        //         //     const contact = await getContact(access_token, 'starlove00168@gmail.com')
        //         //     console.log("FOUND", contact);
        //         //     if (contact && contact.length > 0) {
        //         //         postUrl = `https://api.infusionsoft.com/crm/xmlrpc/v1?access_token=`
        //         //     }
        //         // }, 10000)
    } catch (e) {
        console.log(e);
    }
}

// playground()

module.exports = { getContact, getContactModel, updateContact }