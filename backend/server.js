require("dotenv").config({quiet: true})
const express = require("express")
const http = require("http")
const socketIO = require("socket.io")
const cookieParser = require("cookie-parser")
const cors = require('cors');

const authRoutes = require("./routes/auth")
const profileRoutes = require("./routes/profile")
const roomRoutes = require("./routes/room")
const messageRoutes = require("./routes/message")
const errorHandler = require("./middlewares/errorHandler")
const logger = require("./loggers/logger")
const httpLogger = require("./loggers/httpLogger")
const authenticateToken = require("./middlewares/authMiddleware")
const connectDB = require("./db/connect")

const Message = require("./models/Message")

const app = express()
const server = http.createServer(app)

const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
})

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true 
}));

connectToDB()

app.use(express.json())
app.use(cookieParser())

app.use("/auth", authRoutes)
app.use("/users", authenticateToken, profileRoutes)
app.use("/rooms", authenticateToken, roomRoutes)
app.use("/messages", authenticateToken, messageRoutes)

io.on('connection', (socket) => {
  logger.info('User connected:', socket.id)

  socket.on('join_room', (roomId) => {
    socket.join(roomId)
    logger.info(`Socket ${socket.io} joined room ${roomId}`)
  })

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId)
    logger.info(`Socket ${socket.id} left room ${roomId}`)
  })

  socket.on('send_message', async (data) => {
    try {
      const { roomId, text, userId, username } = data
      
      const message = await Message.create({
        roomId,
        text,
        userId
      })

      await message.populate('userId', 'username')

      io.to(roomId).emit('receive_message', {
        _id: message._id,
        roomId: message.roomId,
        text: message.text,
        userId: {
          _id: message.userId._id,
          username: message.userId.username
        },
        createdAt: message.createdAt
      })

      logger.info(`Message send to room ${roomId}`)
    } catch (err) {
      logger.error('Error sending message', err)
      socket.emit('message_error', {error: "Failed to send message"})
    }
  })

  socket.on('disconnect', () => {
    logger.info("User disconnected:", socket.io)
  })
})

app.use(httpLogger)
app.use(errorHandler)

server.listen(process.env.PORT, () => {
  logger.info(`App is listening on: http://localhost/${process.env.PORT}`)
})

async function connectToDB() {
  try {
    await connectDB()
    logger.info("Connected to database")
  } catch (err) {
    logger.error("Failed to connect to the database", err.message)
  }
}