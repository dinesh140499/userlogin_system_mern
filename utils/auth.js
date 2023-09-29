const User = require("../model/userSchema")
const jwt = require('jsonwebtoken')


exports.auth = async (req, res, next) => {
    const token = req.cookies.token
    try {
        if (token) {
            let decoded = jwt.verify(token, process.env.JWTSECRET)
            req.user = await User.findById(decoded._id)
            next()
        } else {
            res.json({ message: "Please Login First" })
        }
    } catch (error) {
        console.log(error)
    }
}