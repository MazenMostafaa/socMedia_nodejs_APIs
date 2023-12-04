import { userModel } from "../../../db/models/userModel.js"
import pkg from 'bcrypt'
import cloudinary from '../../utils/mediaCloud.config.js'

export const update = async (req, res, next) => {

    const { _id } = req.authUser
    const { username, oldpassword, password, Cpassword, desc, city, from, relationship } = req.body

    const isUserExist = await userModel.findById(_id).lean()

    if (!isUserExist) {
        return next(new Error("invalid user Id", { cause: 400 }))
    }
    const userCheck = await userModel.hydrate(isUserExist)

    if (desc) userCheck.desc = desc
    if (city) userCheck.city = city
    if (from) userCheck.from = from
    if (relationship) userCheck.relationship = relationship

    if (username) {

        if (userCheck.username == username) {
            return next(new Error("please enter different username", { cause: 400 }))
        }

        const checkDuplicate = await userModel.findOne(username)
        if (checkDuplicate) {
            return next(new Error("Sorry! username has already taken", { cause: 400 }))
        }

        userCheck.username = username
    }

    if (password) {

        const isPassMatching = pkg.compareSync(oldpassword, userCheck.password)
        if (!isPassMatching) {
            return res.status(400).json({ Message: "old password is not correct" })
        }

        if (password !== Cpassword) {
            return res.status(400).json({ message: "confirmation password is not compatible" })
        }

        const hashedPassword = pkg.hashSync(password, +process.env.SALT_ROUNDS)

        userCheck.password = hashedPassword

    }

    if (req.files) {

        let profileFlag = false
        let coverFlag = false
        let profilePicture
        let coverPicture
        for (const file in req.files) {

            for (const key of req.files[file]) {
                if (key.fieldname == "profilePicture") {
                    await cloudinary.uploader.destroy(userCheck.profilePicture.public_id)
                    const { secure_url, public_id } = await cloudinary.uploader.upload(key.path,
                        {
                            folder: `${process.env.USERS_FOLDER_ROOT}/profiles/${userCheck._id}`
                        }
                    )
                    profilePicture = { secure_url, public_id }
                    profileFlag = true
                }
                if (key.fieldname == "coverPicture") {
                    await cloudinary.uploader.destroy(userCheck.coverPicture.public_id)
                    const { secure_url, public_id } = await cloudinary.uploader.upload(key.path,
                        {
                            folder: `${process.env.USERS_FOLDER_ROOT}/covers/${userCheck._id}`
                        }
                    )
                    coverPicture = { secure_url, public_id }
                    coverFlag = true
                }
            }

        }

        if (profileFlag) {
            userCheck.profilePicture = profilePicture
        }
        if (coverFlag) {
            userCheck.coverPicture = coverPicture
        }
    }

    const updatedUser = await userCheck.save()
    if (!updatedUser) {
        return next(new Error("Fail to update", { cause: 400 }))
    }
    res.status(200).json({ message: 'user has been Updated successfully', updatedUser })
}