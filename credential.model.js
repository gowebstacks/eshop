const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const credentialSchema = new Schema(
    {
        access_token: {
            type: String
        },
        refresh_token: {
            type: String
        }
    },
)

const Credential = mongoose.model("Credential", credentialSchema);

module.exports = Credential