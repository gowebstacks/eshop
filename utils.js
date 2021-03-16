const axios = require('axios');
require('dotenv').config()
const { getCredential, addCredential, updateCredential } = require('./db')

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
            console.log(res.data);
            return null
        }
    } catch (e) {
        console.log(e);
    }
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

module.exports = { getContact, updateContact }