const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email should be unique"]
    },
    age: {
        type: Number,
        required: [true, "Age is required"],
        validate: {
            validator: function (value) {
                const ageStr = value.toString();
                return ageStr.length <= 3;
            },
            message: 'Age cannot be more than 3 characters long.',
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        validate: {
            validator: function (value) {
                return value.length > 8
            },
            message: 'password should be greater than 8 characters'
        },
        select: false
    },
    photo: {
        public_id: {
            type: String,
            required: true
        },
        uri: {
            type: String,
            required: true

        }
    },
    token: {
        type: String,
        default: ""
    },
    
    createdAt: {
        type: String,
        default: new Date(Date.now())
    }
})

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('Users', userSchema)