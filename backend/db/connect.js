const mongoose = require("mongoose")
 
async function connectDB() {
  const MONGO_ATLAS_URI = process.env.MONGO_ATLAS_URI

  try {
    await mongoose.connect(MONGO_ATLAS_URI)
  } catch (err) {
    console.log(err.message)
  }
}

module.exports = connectDB