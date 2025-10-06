const jwt = require("jsonwebtoken")
const RefreshToken = require("../models/RefreshToken")

async function refresh(req, res, next) {
  try {
    const oldRefreshToken = req.cookies.refreshToken
    
    jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        const error = new Error("Refresh token is invalid or expired")
        error.statusCode = 401
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
          _id: decoded._id,
          email: decoded.email
        }
      })
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {refresh}