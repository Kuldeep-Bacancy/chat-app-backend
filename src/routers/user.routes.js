import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/users.controller.js";
import { loginValidationRules, registerValidationRules } from "../middlewares/userValidation.middlewares.js";
import { validate } from "../middlewares/validation.middlewares.js";

const router = Router()

router.route('/register').post(registerValidationRules(), validate, registerUser)
router.route('/login').post(loginValidationRules(), validate, loginUser)
router.route('/logout').delete(logoutUser)

export default router