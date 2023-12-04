import { Router } from "express";
import * as uc from './user.controller.js'
import { asyncHandler } from "../../utils/errorHandler.js";
import { multerCloudFunction } from '../../services/multerCloudService.js'
import { allowedExtensions } from '../../utils/multerAllowedExtensions.js'
import { isAuth } from '../../middlewares/auth.js'
import { userApisRole } from './user.endPoints.js'
import { validationFunction } from '../../middlewares/validation.js'
import * as validator from './user.validationSchema.js'
const router = Router()



router.put('/update',
    multerCloudFunction(allowedExtensions.Image)
        .fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'coverPicture', maxCount: 1 }]),
    isAuth(userApisRole.UPDATE),
    validationFunction(validator.updateSchema),
    asyncHandler(uc.update))


export default router