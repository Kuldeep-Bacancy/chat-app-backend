import { Chat } from "../models/chat.models.js";
import ApiResponse from "../utils/ApiResponse.js";

export const isCurrentUserIsAdmin = async (req, res, next) => {
  const { groupId } = req.body

  const existingGroup = await Chat.findOne({
    _id: groupId,
    isGroupChat: true
  })

  if (!existingGroup) {
    return res.status(404).json(
      new ApiResponse(400, "Group not found!")
    )
  }

  if (!req.user?._id.equals(existingGroup.groupAdmin)) {
    return res.status(422).json(
      new ApiResponse(422, 'You are not authorized to do this action!')
    )
  }

  next()
}