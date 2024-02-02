import { getAllMessages, sendMessage } from "../controllers/messages.controller.js";
import verfiyJWT from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

import { Router } from "express";

const router = Router()

router.route('/').post(verfiyJWT, upload.array('attachments', 2), sendMessage)
router.route('/:chatId').get(verfiyJWT, getAllMessages)

export default router