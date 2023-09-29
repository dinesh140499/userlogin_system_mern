const express = require('express')
const route = express.Router()
const { getAllUsers, createUser, loginUser, logout, updateUser, deleteUser, verifyOtp, emailOtpSend, forgotPassword,resetPassword } = require('../controller/user')
const { auth } = require('../utils/auth')

route.route('/users').get(auth, getAllUsers)
route.route('/user/emailOtpSend').post(emailOtpSend)
route.route('/user/verifyOtp').post(verifyOtp)
route.route('/user/new').post(createUser)
route.route('/user/login').post(loginUser)
route.route('/user/logout').get(auth, logout)
route.route('/user/:id').put(auth, updateUser).delete(auth, deleteUser)
route.route('/user/forgetPassword').post(forgotPassword)
route.route('/user/resetPassword').get(resetPassword)

module.exports = route