import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/users.controller.js";

const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').delete(logoutUser)

export default router