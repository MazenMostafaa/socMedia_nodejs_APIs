import { userModel } from "../../../db/models/userModel.js"
import { chatModel } from "../../../db/models/chatModel.js"

export const sendMessage = async (req, res, next) => {

    const { _id } = req.authUser
    const { message, destId } = req.body

    const destUser = await userModel.findById(destId)
    if (!destUser) {
        return next(new Error('In-valid destination user Id', { cause: 400 }))
    }

    const chat = await chatModel.findOne({
        $or: [
            { pOne: _id, pTwo: destId },
            { pOne: destId, pTwo: _id }
        ]
    }).populate([
        {
            path: 'pOne'
        },
        {
            path: 'pTwo'
        }
    ])
    // if there is not chat
    if (!chat) {
        const newChat = await chatModel.create({
            pOne: _id,
            pTwo: destId,
            messages: {
                message,
                from: _id,
                to: destId
            }
        })
        // Socket emit receiveMessage here
        return res.status(201).json({ message: "Done", newChat })
    }
    // In case there is a chat already exist
    chat.messages.push({
        message,
        from: _id,
        to: destId
    })
    await chat.save()
    // Socket emit receiveMessage here
    res.status(201).json({ message: "Done", chat })
}

export const getChat = async (req, res, next) => {
    const { _id } = req.authUser
    const { destId } = req.params

    const chat = await chatModel.findOne({
        $or: [
            { pOne: _id, pTwo: destId },
            { pOne: destId, pTwo: _id }
        ]
    }).populate([
        {
            path: 'pOne'
        },
        {
            path: 'pTwo'
        }
    ])
    // Socket emit receiveMessage here
    res.status(200).json({ message: "Done", chat })
}