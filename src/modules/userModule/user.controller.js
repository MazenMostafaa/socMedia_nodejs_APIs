import { userModel } from "../../../db/models/userModel.js"
import pkg from 'bcrypt'
import cloudinary from '../../utils/mediaCloudConfig.js'
import { systemRoles } from "../../utils/systemRoles.js"

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
        if (!Cpassword && !oldpassword) {
            return res.status(400).json({ Message: "must submit confirm and old password" })
        }
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

export const getUser = async (req, res, next) => {
    const { userId } = req.query

    const getuser = await userModel.findById(userId)
    if (!getuser) {
        return next(new Error("invalid user Id", { cause: 400 }))
    }

    const { password, updatedAt, ...other } = getuser._doc

    res.status(200).json({ Message: "Done", other })

}

export const deleteUser = async (req, res, next) => {
    const { _id, role } = req.authUser
    const { userId } = req.query

    if (role == systemRoles.USER && userId.toString() !== _id.toString()) {
        return next(new Error("un-authorized to delete this account", { cause: 400 }))
    }

    const deleteduser = await userModel.findByIdAndDelete(userId)
    if (!deleteduser) {
        return next(new Error("invalid user Id", { cause: 400 }))
    }

    //=========== Delete from cloudinary ==============
    await cloudinary.api.delete_resources_by_prefix(
        `${process.env.USERS_FOLDER_ROOT}/profiles/${userId}`,
    )
    await cloudinary.api.delete_folder(
        `${process.env.USERS_FOLDER_ROOT}/profiles/${userId}`,
    )

    await cloudinary.api.delete_resources_by_prefix(
        `${process.env.USERS_FOLDER_ROOT}/covers/${userId}`,
    )

    await cloudinary.api.delete_folder(
        `${process.env.USERS_FOLDER_ROOT}/covers/${userId}`,
    )


    res.status(200).json({ Message: "deleted Done", deleteduser })

}

export const follow = async (req, res, next) => {
    const { _id } = req.authUser
    const { followedId } = req.query

    if (_id.toString() == followedId.toString()) {
        return next(new Error("can't followed yourself", { cause: 400 }))
    }

    const currentUser = await userModel.findById(_id)
    const followedUser = await userModel.findById(followedId)
    if (!followedUser) {
        return next(new Error("couldn't find followed user", { cause: 400 }))
    }

    if (followedUser.followers.includes(currentUser._id)) {
        return next(new Error("you've Already followed this user", { cause: 400 }))
    }

    const currentuser = await userModel
        .findByIdAndUpdate(currentUser._id, { $push: { following: followedId } }, { new: true })
        .select('_id followers following')
    await userModel.findByIdAndUpdate(followedUser._id, { $push: { followers: _id } }, { new: true })

    res.status(200).json({
        message: "following is done",
        userFollowers_ing: currentuser
    })
}

export const unfollow = async (req, res, next) => {
    const { _id } = req.authUser
    const { unfollowedId } = req.query

    if (_id.toString() == unfollowedId.toString()) {
        return next(new Error("can't unfollow yourself", { cause: 400 }))
    }

    const currentUser = await userModel.findById(_id).select('_id followers following')
    const unfollowedUser = await userModel.findById(unfollowedId)
    if (!unfollowedUser) {
        return next(new Error("couldn't find unfollowed user", { cause: 400 }))
    }

    if (!unfollowedUser.followers.includes(currentUser._id)) {
        return next(new Error("you didn't follow this user", { cause: 400 }))
    }

    const currentuser = await userModel
        .findByIdAndUpdate(currentUser._id, { $pull: { following: unfollowedId } }, { new: true })
        .select('_id followers following')
    await userModel.findByIdAndUpdate(unfollowedUser._id, { $pull: { followers: _id } }, { new: true })

    res.status(200).json({
        message: "unfollowing is done",
        userFollowers_ing: currentuser
    })
}