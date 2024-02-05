import { Chat } from "../models/chat.models.js"
import ApiResponse from "../utils/ApiResponse.js"

const createOneOnOneChat = async(req, res) => {
  try {
    const { userId } = req.body

    const isChat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user?._id }}},
        { users: { $elemMatch: { $eq: userId }}}
      ]
    })

    if(isChat){
      return res.status(422).json(
        new ApiResponse(422, "Chat with this user already exist!")
      )
    }

    const newChat = await Chat.create({
      name: 'One On One Chat',
      isGroupChat: false,
      users: [req.user?._id, userId]
    })

    if(!newChat){
      return res.status(500).json(
        new ApiResponse(500, 'There are some issues while creating chat!')
      )
    }

    const chat = await Chat.findOne({ _id: newChat._id }).populate("users", "-password -refreshToken -resetPasswordToken").populate("latestMessage")

    return res.status(200).json(
      new ApiResponse(200, 'Chat created successfully!', chat)
    )
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    )
  }
}

const currentUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user?._id } } }).populate("users", "-password -refreshToken -resetPasswordToken").populate("latestMessage")

    return res.status(200).json(
      new ApiResponse(200, 'Chat fetched successfully!', chats)
    )
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    )
  }
}

const fetchChat = async (req, res) => {
  try {
    const chatId = req.params.chatId

    const chat = await Chat.findOne({ _id: chatId }).populate("users", "-password -refreshToken -resetPasswordToken").populate("groupAdmin", "-password -refreshToken -resetPasswordToken")

    if (!chat) {
      return res.status(404).json(
        new ApiResponse(404, "Chat not found!")
      )
    }

    return res.status(200).json(
      new ApiResponse(200, "Chat fetched Successfully!", chat)
    )
  } catch (error) {
    
  }
}

const createGroup = async (req, res) => {
  try {
    const { name, userIds } = req.body
    console.log("name", name);
    console.log("userIds", userIds);

    if(!name || userIds.length <= 0){
      return res.status(400).json(
        new ApiResponse(400, "Name and Users are required to create group!")
      )
    }

    const users = [...userIds, req.user?._id]

    if (users.length < 2){
      return res.status(400).json(
        new ApiResponse(400, "You can't create group with less than two members")
      )
    }

    const newGroup = await Chat.create({
      name: name,
      isGroupChat: true,
      groupAdmin: req.user,
      users: [...userIds, req.user?._id]
    })

    if (!newGroup) {
      return res.status(500).json(
        new ApiResponse(500, 'There are some issues while creating Group!')
      )
    }

    const group = await Chat.findOne({ _id: newGroup._id }).populate("users", "-password -refreshToken -resetPasswordToken").populate("groupAdmin", "-password -refreshToken -resetPasswordToken")

    return res.status(200).json(
      new ApiResponse(200, 'Chat created successfully!', group)
    )
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    )
  }
}

const updateGroupName = async (req, res) => {
  try {
    const { name, groupId } = req.body

    const group = await Chat.findOneAndUpdate(
      { _id: groupId,  isGroupChat: true },
      { name: name },
      { new: true }
    )

    if(!group){
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while updating group name!")
      )
    }

    return res.status(200).json(
      new ApiResponse(200, "Group name updated successfully!", group)
    )

  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    )
  }
}

const addOrRemoveFromGroup = async (req, res) => {
  try {
    const { userIds, groupId } = req.body

    const chat = await Chat.findOne({
      _id: groupId, isGroupChat: true
    })

    if (!userIds.includes(chat.groupAdmin._id.toString())){
      return res.status(422).json(
        new ApiResponse(422, 'You can not remove your self from the group because you are admin!')
      )
    }

    const group = await Chat.findOneAndUpdate(
      { _id: groupId, isGroupChat: true },
      { $set: { users: userIds } },
      { new: true }
    ).populate("users", "-password -refreshToken -resetPasswordToken").populate("groupAdmin", "-password -refreshToken -resetPasswordToken")

    if (!group) {
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while updating members of group!")
      )
    }

    return res.status(200).json(
      new ApiResponse(200, "Members Updated Successfully!", group)
    )

  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    )
  }
}

export { createOneOnOneChat, currentUserChats, createGroup, updateGroupName, addOrRemoveFromGroup, fetchChat }