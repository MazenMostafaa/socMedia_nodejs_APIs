import mongoose, { Schema } from "mongoose";
import { systemRoles } from '../../src/utils/systemRoles.js'

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        min: 3,
        max: 20,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePicture: {
        secure_url: String,
        public_id: String,
        default: {}
    },

    role: {
        type: String,
        enum: [systemRoles.USER, systemRoles.ADMIN],
        required: true,
        default: systemRoles.USER
    },
    coverPicture: {
        secure_url: String,
        public_id: String,
        default: {}
    },
    followers: {
        type: Array,
        default: []
    },
    following: {
        type: Array,
        default: []
    },
    token: {
        type: String,
        default: ''
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },

}, {
    timestamps: true
})

export const userModel = mongoose.model('user', userSchema)