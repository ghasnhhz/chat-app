const User = require("../models/User")

async function createProfile(req, res, next) {
  try {
    const { username, age, role } = req.body

    if (!username || !role || !age) {
      const error = new Error("Fill in all fields")
      error.statusCode = 400
      return next(error)
    }

    const userId = req.user._id
    const user = await User.findByIdAndUpdate(userId, {
      username,
      age, 
      role,
      isProfileComplete: true,
    }, { new: true })
    
    res.status(200).json({
      message: "User information updated successfully",
      user: {
        email: user.email,
        username: user.username,
        age: user.age,
        role: user.role,
        isProfileComplete: user.isProfileComplete
      }
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {createProfile}