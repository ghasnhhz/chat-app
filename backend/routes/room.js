const express = require("express")
const {createRoom, getMyRooms, getRoomById, joinRoom, leaveRoom, deleteRoom} = require("../controllers/roomController")
const router = express.Router()

router.post("/create", createRoom)
router.get("/my-rooms", getMyRooms)
router.get("/:roomId", getRoomById)
router.post("/join/:inviteToken", joinRoom)
router.post("/:roomId/leave", leaveRoom)
router.delete("/:roomId", deleteRoom)

module.exports = router