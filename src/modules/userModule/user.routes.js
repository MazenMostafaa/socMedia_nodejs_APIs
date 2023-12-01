import { Router } from "express";
const router = Router()
import * as userController from './user.controller.js'
import { asyncHandler } from "../../utils/errorHandler.js";




export default router