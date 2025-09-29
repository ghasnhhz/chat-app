require("dotenv").config({quiet: true})
const express = require("express")
const connectDB = require("./db/connect")
const app = express()

async function connectToDB() {
  try {
    await connectDB()
    console.log("Connected to database")
  } catch (err) {
    console.log("Failed to connect to the database", err.message)
  }
}
connectToDB()


app.listen(process.env.PORT, () => {
  console.log(`App is listening on: http://localhost/${process.env.PORT}`)
})