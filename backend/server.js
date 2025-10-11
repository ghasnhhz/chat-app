require("dotenv").config({quiet: true})
const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require('cors');
const authRoutes = require("./routes/auth")
const profileRoutes = require("./routes/profile")
const roomRoutes = require("./routes/room")
const errorHandler = require("./middlewares/errorHandler")
const authenticateToken = require("./middlewares/authMiddleware")
const connectDB = require("./db/connect")
const app = express()

app.use(cors({
  origin: 'http://localhost:3000', // React dev server
  credentials: true // Important for cookies
}));

connectToDB()

app.use(express.json())
app.use(cookieParser())
app.use("/auth", authRoutes)
app.use("/users", authenticateToken, profileRoutes)
app.use("/rooms", authenticateToken, roomRoutes)

app.use(errorHandler)

app.listen(process.env.PORT, () => {
  console.log(`App is listening on: http://localhost/${process.env.PORT}`)
})

async function connectToDB() {
  try {
    await connectDB()
    console.log("Connected to database")
  } catch (err) {
    console.log("Failed to connect to the database", err.message)
  }
}