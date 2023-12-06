import mongoose, { Schema } from "mongoose";

const postSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    desc: {
        type: String,
        max: 500,
        trim: true,
        required: true
    },
    medias: [{
        secure_url: String,
        public_id: String,
    }],
    likes: {
        type: [{ type: Schema.Types.ObjectId, ref: 'user' }],
        default: []
    },
},
    {
        timestamps: true

    })

export const postModel = mongoose.model('post', postSchema)