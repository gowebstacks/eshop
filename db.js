const Credential = require('./credential.model')

const getCredential = async () => {
    try {
        const cred = await Credential.find({})
        return cred
    } catch (e) {
        console.log(e);
    }
}
// getCredential()
const addCredential = async (credential) => {
    try {
        const cred = new Credential({
            ...credential
        })
        await cred.save()
        console.log("ADDED", cred);
    } catch (e) {
        console.log(e);
    }
}

const updateCredential = async (id, newCredData) => {
    try {
        const updated = await Credential.findByIdAndUpdate(
            id,
            {
                actual_token: newCredData.actual_token,
                refresh_token: newCredData.refresh_token,
            },
            { new: true }
        )
        if (updated) {
            await updated.save()
            console.log("UPDATED", updated);
            return updated
        } else {
            console.log("credential not found in db");
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports = { getCredential, addCredential, updateCredential }