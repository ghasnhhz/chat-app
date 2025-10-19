require("dotenv").config({quiet: true})
const express = require("express")
const cookieParser = require("cookie-parser")
const authRoutes = require("./routes/auth")
const errorHandler = require("./middlewares/errorHandler")
const connectDB = require("./db/connect")
const app = express()

connectToDB()

app.use(express.json())
app.use(cookieParser())
app.use("/auth", authRoutes)

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