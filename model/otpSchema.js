const mongoose = require('mongoose')

const otpModel = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "field cannot be blank"]
    },
    otp: {
        type: String,
        required: [true, "field cannot be blank"]
    },
    isVerified:Boolean
})

module.exports = mongoose.model("OtpModel", otpModel)