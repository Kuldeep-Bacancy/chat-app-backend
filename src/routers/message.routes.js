import { getAllMessages, sendMessage } from "../controllers/messages.controller.js";
import verfiyJWT from "../middlewares/auth.middlewares.js";

import { Router } from "express";

const router = Router()

router.route('/').post(verfiyJWT, sendMessage)
router.route('/').get(verfiyJWT, getAllMessages)

export default router