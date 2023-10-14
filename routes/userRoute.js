const express = require('express')
const route = express.Router()
const { getAllUsers, createUser, loginUser, logout, updateUser, deleteUser, verifyOtp, emailOtpSend, forgotPassword,resetPassword } = require('../controller/user')
const { auth } = require('../utils/auth')

route.route('/allUsers').get(auth, getAllUsers)
route.route('/emailOtpSend').post(emailOtpSend)
route.route('/verifyOtp').post(verifyOtp)
route.route('/new').post(createUser)
route.route('/login').post(loginUser)
route.route('/logout').get(auth, logout)
route.route('/:id').put(auth, updateUser).delete(auth, deleteUser)
route.route('/forgetPassword').post(forgotPassword)
route.route('/resetPassword').get(resetPassword)

module.exports = route