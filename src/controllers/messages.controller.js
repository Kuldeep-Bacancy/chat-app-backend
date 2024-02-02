import { Chat } from "../models/chat.models.js"
import { Message } from "../models/message.models.js"
import ApiResponse from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const sendMessage = async (req, res) => {
  try {
    const { content, chatId } = req.body
    let imageUrls = []

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      let multiplePicturePromise = req.files.map((picture) =>
        uploadOnCloudinary(picture.path, picture.originalname)
      );

      let imageResponses = await Promise.all(multiplePicturePromise);
      imageResponses.forEach((res) => {
        imageUrls.push({ name: res.public_id, type: res.format, url: res.url })
      })
    }

    const msg = await Message.create({
      sender: req.user?._id,
      content: content,
      chat: chatId,
      attachments: imageUrls
    })

    console.log("message", msg);

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

export { sendMessage, getAllMessages }