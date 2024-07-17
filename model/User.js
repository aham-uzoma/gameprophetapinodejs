const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        favouriteTeam: {
            type: String,
            required: true
        },
        userID: {
            type: String,
            unique: true,
        },
        comments: [{ // Array to store user's comments
            content: {
                type: String,
            }
            // createdAt: {
            //     type: Date,
            //     default: Date.now // Timestamp for comment creation
            // },
        }],
        roles:{
            User:{
                type: Number,
                default: 3012,
            },
            Admin: Number,
            SuperAdmin: Number
        },
        isVerified:{
            type:Boolean,
            default: false,
        },
        emailToken:{
            type:String,
        },
        refreshToken: String
    },
    {
        timestamps: true
    }
)
module.exports = mongoose.model('User', userSchema)