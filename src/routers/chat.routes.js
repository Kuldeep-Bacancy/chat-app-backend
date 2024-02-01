import { Router } from "express";
import verfiyJWT from "../middlewares/auth.middlewares.js";
import { createOneOnOneChat, currentUserChats, createGroup, updateGroupName, addOrRemoveFromGroup, fetchChat } from "../controllers/chats.controller.js";
import { isCurrentUserIsAdmin } from "../middlewares/isCurrentUserIsAdmin.middlewares.js";

const router = Router()

router.route('/').post(verfiyJWT, createOneOnOneChat)
router.route('/').get(verfiyJWT, currentUserChats)
router.route('/group').post(verfiyJWT, createGroup)
router.route('/update-group-name').put(verfiyJWT, isCurrentUserIsAdmin, updateGroupName)
router.route('/update-group-members').put(verfiyJWT, isCurrentUserIsAdmin, addOrRemoveFromGroup)
router.route('/:chatId').get(verfiyJWT, fetchChat)

export default router