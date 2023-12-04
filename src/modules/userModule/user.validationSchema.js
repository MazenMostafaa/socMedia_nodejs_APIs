import joi from 'joi'
import { generalFields } from '../../utils/validationGeneralFields.js'

export const updateSchema = {
    body: joi
        .object({
            username: generalFields.username.optional(),

            password: generalFields.password.optional(),

            Cpassword: generalFields.password.when('password', {
                is: true,
                then: joi.valid(joi.ref('password')).required(),
                otherwise: joi.optional()
            }),

            oldpassword: generalFields.password.when('password', {
                is: true,
                then: joi.required(),
                otherwise: joi.optional()
            }),

            desc: joi.string().max(50).optional(),
            city: joi.string().min(3).max(25).optional(),
            from: joi.string().min(3).max(20).optional(),
            relationship: joi.string().valid('single', 'engaged', 'divorced').optional(),
            files: generalFields.files.optional()

        })
        .required()
}