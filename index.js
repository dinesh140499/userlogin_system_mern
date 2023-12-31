const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const fileUpload=require('express-fileupload')
const cors=require('cors')

// console.log(new Date(Date.now()))

dotenv.config({ path: "./config/config.env" })

// database connection
require('./utils/conn.js')
const userRoute = require('./routes/userRoute')

// Middlewares
app.use(cors())
app.use(fileUpload({useTempFiles:true}))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/v1/user', userRoute)


app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`)
})
