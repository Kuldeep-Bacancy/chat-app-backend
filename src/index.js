import dotenv from 'dotenv'
import connectDB from "./db/connect.js";
import app from './app.js'
import { Server } from 'socket.io';
import { createServer } from "http";
import ApiResponse from './utils/ApiResponse.js';
import ApiError from './utils/ApiError.js';

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
  try {
    console.log(`⚡: ${socket.id} user just connected`);

    socket.on("setup", async (userInfo) => {
      socket.user = userInfo

      // We are creating a room with user id so that if user is joined but does not have any active chat going on.
      // still we want to emit some socket events to the user.
      // so that the client can catch the event and show the notifications.
      socket.join(userInfo._id.toString());
    })

    socket.on('join-chat', (room) => {
      socket.join(room)
      console.log(`----------------------User (${socket.id}) joined room: ${room}----------------`)
    })

    socket.on('typing', (room) => {
      socket.in(room).emit('typing')
    })

    socket.on('stop typing', (room) => {
      socket.in(room).emit('stop typing')
    })

    socket.on('new-message', (newMessage) => {
      let chat = newMessage?.chat
      socket.in(chat?._id).emit('message-received', newMessage)
      socket.emit('notification-received', newMessage)
    })

    socket.on('delete-message', (deleteMessage) => {
      let chat = deleteMessage?.chat
      socket.in(chat).emit('message-deleted')
    })

    socket.on('notification-sent', (msgData) => {
      const users =  msgData.chat.users
      users.forEach(user => {
        if(user != msgData.sender._id){
          socket.in(user).emit('notification-received', msgData)
        }
      });
    })

    socket.on('disconnect', () => {
      if (socket.user?._id) {
        socket.leave(socket.user._id);
      }
      console.log(`A ${socket.id} user disconnected`);
    })
  } catch (error) {
    new ApiError(
      500,
      "Something went wrong!"
    );
  }
});