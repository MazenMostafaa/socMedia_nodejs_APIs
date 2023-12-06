import mongoose, { Schema } from "mongoose";

const postSchema = new mongoose.Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        desc: {
            type: String,
            max: 500,
            required: true
        },
        img: {
            secure_url: String,
            public_id: String
        },
        likes: {
            type: [{ type: Schema.Types.ObjectId, ref: 'user' }],
            default: []
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("post", postSchema);