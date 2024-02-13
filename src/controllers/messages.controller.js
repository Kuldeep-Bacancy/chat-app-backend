import { Chat } from "../models/chat.models.js"
import { Message } from "../models/message.models.js"
import ApiResponse from "../utils/ApiResponse.js"
import { uploadImageOnCloudinaryJob } from "../utils/ImageUploadWorker.js"
import { deleteImageFromCloudinaryJob } from "../utils/deleteImageWorker.js"


const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body
    let imageData = []

    const msg = await Message.create({
      sender: req.user?._id,
      content: content,
      chat: chatId
    })

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.files.forEach((picture) =>
        imageData.push({ path: picture.path, fileName: picture.originalname })
      )

      await uploadImageOnCloudinaryJob({
        type: 'uploadOnCloudinary',
        data: {
          images: imageData,
          msgId: msg._id
        }
      })
    }

    if(!msg){
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while sending the message!")
      )
    }

    const newMessage = await Message.findOne({
      _id: msg._id
    })
    .populate('sender', '-refreshToken -resetPasswordToken -password')
    .populate('chat')

    await Chat.findOneAndUpdate(
      { _id: chatId },
      { $set: { latestMessage: msg._id }},
      { new: true }
    )

    return res.status(200).json(
      new ApiResponse(200, "Message Sent Successfully!", newMessage)
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

const deleteMessage = async (req, res) => {
  try {
    const msgId = req.params.msgId

    const msg = await Message.findOne({ _id: msgId })

    if(!msg){
      return res.status(404).json(
        new ApiResponse(404, "Message not found!")
      )
    }

    const attachments = msg.attachments

    await Message.deleteOne({ _id: msgId })

    if(attachments){
      let multiplePicturePromise = attachments.map((attachment) =>
        deleteImageFromCloudinaryJob(
          {
            type: 'deleteImageFromCloudinary',
            data: {
              name: attachment.name
            }
          }
        )
      )

      await Promise.all(multiplePicturePromise);
    }

    return res.status(200).json(
      new ApiResponse(200, "Message deleted successfully!", msg)
    )
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    ) 
  }
}

const deleteAllMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId

    const chat = await Chat.findOne({ _id: chatId })

    if (!chat) {
      return res.status(404).json(
        new ApiResponse(404, "Chat not found!")
      ) 
    }

    const removeMessages = await Message.deleteMany({
      chat: chatId
    })

    if(!removeMessages){
      return res.status(500).json(
        new ApiResponse(500, "Something went wrong while deleting the messages!")
      )
    }

    return res.status(200).json(
      new ApiResponse(200, 'Clear Chat Successfully!')
    )
  } catch (error) {
    return res.status(500).json(
      new ApiResponse(500, error.message)
    ) 
  }
}

export { sendMessage, getAllMessages, deleteMessage, deleteAllMessages }