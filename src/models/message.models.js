import mongoose from "mongoose";

const AttachmentSchema = mongoose.Schema({
  type:{
    type: String
  },
  url:{
    type: String
  },
  name: {
    type: String
  }
}, { timestamps: true })

const messageSchema = mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: {
    type: String,
    trim: true
  },
  attachments: [AttachmentSchema],
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  }
}, { timestamps: true })

export const Message = mongoose.model('Message', messageSchema)