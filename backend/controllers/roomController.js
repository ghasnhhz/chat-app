const mongoose = require("mongoose")
const Room = require("../models/Room")
const crypto = require("crypto")

async function createRoom(req, res, next) {
  const { name } = req.body
  const userId = req.user._id
  
  if (!name) {
    const error = new Error("Please, name your room")
    error.statusCode = 400
    return next(error)
  }

  const inviteToken = crypto.randomBytes(4).toString('hex')

  const room = await Room.create({
    name,
    inviteToken,
    createdBy: userId,
    members: [userId],
  })

  const inviteLink = `${process.env.APP_URL}/join/${inviteToken}`

  res.status(201).json({
    room,
    inviteLink
  })
}

async function getMyRooms(req, res, next) {
  try {
    const userId = req.user._id

    const rooms = await Room.find({ members: userId })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
    
    res.status(200).json({rooms})
  } catch (err) {
    next(err)
  }
}

async function getRoomById(req, res, next) {
  try {
    const { roomId } = req.params

    const room = await Room.findById(roomId)
      .populate('createdBy', 'username age role')
      .populate('members', 'username age role')

    if (!room) {
      const error = new Error("Room not found")
      error.statusCode = 404
      return next(error)
    }

    const membersLength = room.members.length

    res.status(200).json({room, membersLength})
  } catch (err) {
    next(err)
  }
}

async function joinRoom(req, res, next) {
  try {
    const { inviteToken } = req.params
    const userId = req.user._id

    const room = await Room.findOne({ inviteToken })
    
    if (!room) {
      const error = new Error("Invalid intive link")
      error.statusCode = 404
      return next(error)
    }

    if (room.members.includes(userId)) {
      res.status(200).json({
        message: "You are already in that room",
        room
      })
    }

    room.members.push(userId)
    await room.save()

    res.status(200).json({
      message: "Joined room successfully",
      room
    })
  } catch (err) {
    next(err)
  }
}

async function leaveRoom(req, res, next) {
  try {
    const { roomId } = req.params
    const userId = req.user._id
    
    const room = await Room.findById(roomId)

    if (!room) {
      const error = new Error("Room not found")
      error.statusCode = 404
      return next(error)
    }

    await Room.findByIdAndUpdate(roomId, {
      $pull: {members: userId}
    })

    res.status(200).json({message: "Left the room successfully"})
  } catch (err) {
    next(err)
  }
}

async function deleteRoom(req, res, next) {
  try {
    const { roomId } = req.params
    const userId = req.user._id

    const room = await Room.findById(roomId)

    if (!room) {
      const error = new Error("Room not found")
      error.statusCode = 404
      return next(error)
    }

    if (room.createdBy.toString() !== userId) {
      const error = new Error("Only room creater can delete this room")
      error.statusCode = 403
      next(error)
    } 

    await Room.findByIdAndDelete(roomId)

    res.status(200).json({message: "Room deleted successfully"})
  } catch (err) {
    next(err)
  }
}

module.exports = {createRoom, getRoomById, getMyRooms, joinRoom, leaveRoom, deleteRoom}