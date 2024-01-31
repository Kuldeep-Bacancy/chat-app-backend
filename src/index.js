import dotenv from 'dotenv'
import connectDB from "./db/connect.js";
import app from './app.js'
import { Server } from 'socket.io';
import { createServer } from "http";
import ApiResponse from './utils/ApiResponse.js';

const server = createServer(app)
const io = new Server(server)

dotenv.config({
  path: './.env'
})

connectDB()
.then(() => {
  const port = process.env.PORT || 3001
  server.listen(port, () => {
    console.log("Server listening on:", port);
  })

  app.get('/', (req, res) => {
    return res.status(200).json(
      new ApiResponse(200, "Everything is healthy!")
    )
  })
}
)
.catch((error) => {
  console.log("DB connection failed", error.message);
})

io.on('connection', (socket) => {
  socket.on('join-chat', (room) => {
    socket.join(room)
    console.log(`----------------------User (${socket.id}) joined room: ${room}----------------`)
  })

  socket.on('typing',(room) => {
    socket.in(room).emit('typing')
  })

  socket.on('stop typing', (room) => {
    socket.in(room).emit('stop typing')
  })

  socket.on('new-message', (newMessage) => {
    let chat = newMessage?.chat
    socket.in(chat?._id).emit('message-received', newMessage)
  })
});