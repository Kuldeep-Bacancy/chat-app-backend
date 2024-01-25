import { Router } from "express";
import { forgetPassword, loginUser, logoutUser, registerUser, resetPassword } from "../controllers/users.controller.js";
import { loginValidationRules, registerValidationRules } from "../middlewares/userValidation.middlewares.js";
import { validate } from "../middlewares/validation.middlewares.js";
import verfiyJWT from "../middlewares/auth.middlewares.js"

const router = Router()

router.route('/register').post(registerValidationRules(), validate, registerUser)
router.route('/login').post(loginValidationRules(), validate, loginUser)
router.route('/logout').delete(verfiyJWT, logoutUser)
router.route('/forget-password').post(forgetPassword)
router.route('/reset-password').post(resetPassword)

export default router