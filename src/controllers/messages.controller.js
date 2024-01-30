import { Chat } from "../models/chat.models.js"
import { Message } from "../models/message.models.js"
import ApiResponse from "../utils/ApiResponse.js"


const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body

    const msg = await Message.create({
      sender: req.user?._id,
      content: content,
      chat: chatId
    })

    if(!msg){
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while sending the message!")
      )
    }

    await Chat.findOneAndUpdate(
      { _id: chatId },
      { $set: { latestMessage: msg._id }},
      { new: true }
    )

    return res.status(200).json(
      new ApiResponse(200, "Message Sent Successfully!", msg)
    )

  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    ) 
  }
}

const getAllMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId

    console.log("chatId", chatId);

    const messages = await Message.find({
      chat: chatId
    })
    .populate("sender", "-refreshToken -resetPasswordToken -password")
    .populate("chat")

    return res.status(200).json(
      new ApiResponse(200, "Message fetched Successfully!", messages)
    )
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    ) 
  }
  
}

export { sendMessage, getAllMessages }