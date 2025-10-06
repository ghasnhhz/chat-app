const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const RefreshToken = require("../models/RefreshToken")

async function register(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      const error = new Error("email or password missing")
      error.statusCode = 400
      return next(error)
    }

    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      const error = new Error("email is already taken")
      error.statusCode = 409
      return next(error) 
    }

    const user = await User.create({ email, password })
    
    const accessToken = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'}
    )

    const refreshToken = jwt.sign(
      {_id: user._id, email: user.email}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'}
    )

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 
    })

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id
    })

    res.status(201).json({
      message: "User successfully registered",
      token: accessToken,
      user: {
        _id: user._id,
        email: user.email
      }
    })
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      const error = new Error("Email or password missing")
      error.statusCode = 400
      return next(error)
    }

    const user = await User.findOne({ email })
  
    if (!user) {
      const error = new Error("Invalid email")
      error.statusCode = 401
      return next(error)
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      const error = new Error("Incorrect password")
      error.statusCode = 401
      return next(error)
    }

    await RefreshToken.findOneAndDelete({ userId: user._id })
      
    const newAccessToken = jwt.sign({ _id: user._id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
    const newRefreshToken = jwt.sign({ _id: user._id, email: user.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" })
    
    await RefreshToken.create({
      token: newRefreshToken,
      userId: user._id
    })

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
        email: user.email
      }
    })
  } catch (err) {
    next(err)
  }
}

async function logout(req, res, next) {
  try {
    const oldRefreshToken = req.cookies.refreshToken

    await RefreshToken.deleteMany({ token: oldRefreshToken })
      
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      message: "Logout successful"
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {register, login, logout}