const jwt = require("jsonwebtoken")
const RefreshToken = require("../models/RefreshToken")
const User = require("../models/User")

async function refresh(req, res, next) {
  try {
    const oldRefreshToken = req.cookies.refreshToken

    if (!oldRefreshToken) {
      const error = new Error("No refresh token provided")
      error.statusCode = 401
      return next(error)
    }
    
    jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        const error = new Error("Refresh token is invalid or expired")
        error.statusCode = 401
        return next(error)
      }

      const user = await User.findById(decoded._id).select('-password')

      if (!user) {
        const error = new Error("User not found")
        error.statusCode = 404
        return next(error)
      }

      await RefreshToken.findOneAndDelete({ userId: decoded._id })
      
      const newAccessToken = jwt.sign({ _id: decoded._id, email: decoded.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
      const newRefreshToken = jwt.sign({ _id: decoded._id, email: decoded.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
      
      await RefreshToken.create({ token: newRefreshToken, userId: decoded._id })

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
      })

      res.status(200).json({
        token: newAccessToken,
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          age: user.age,
          role: user.role,
          isProfileComplete: user.isProfileComplete
        }
      })
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {refresh}