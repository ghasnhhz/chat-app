const express = require("express")
const router = express.Router()
const { getMessages } = require("../controllers/MessageController")

router.get('/:roomId', getMessages)

module.exports = router