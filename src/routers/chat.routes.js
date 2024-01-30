import { Router } from "express";
import verfiyJWT from "../middlewares/auth.middlewares.js";
import { createOneOnOneChat, currentUserChats, createGroup, updateGroupName, addToGroup, removeFromGroup, fetchChat } from "../controllers/chats.controller.js";

const router = Router()

router.route('/').post(verfiyJWT, createOneOnOneChat)
router.route('/').get(verfiyJWT, currentUserChats)
router.route('/group').post(verfiyJWT, createGroup)
router.route('/update-group-name').put(verfiyJWT, updateGroupName)
router.route('/add-group').put(verfiyJWT, addToGroup)
router.route('/remove-group').put(verfiyJWT, removeFromGroup)
router.route('/:chatId').get(verfiyJWT, fetchChat)

export default router