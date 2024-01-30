import { Router } from "express";
import verfiyJWT from "../middlewares/auth.middlewares.js";
import { createOneOnOneChat, currentUserChats, createGroup, updateGroupName, addOrRemoveFromGroup, fetchChat } from "../controllers/chats.controller.js";

const router = Router()

router.route('/').post(verfiyJWT, createOneOnOneChat)
router.route('/').get(verfiyJWT, currentUserChats)
router.route('/group').post(verfiyJWT, createGroup)
router.route('/update-group-name').put(verfiyJWT, updateGroupName)
router.route('/update-group-members').put(verfiyJWT, addOrRemoveFromGroup)
router.route('/:chatId').get(verfiyJWT, fetchChat)

export default router