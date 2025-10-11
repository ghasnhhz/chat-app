const express = require("express")
const router = express.Router()
const { createProfile } = require("../controllers/profileController")

router.put("/profile", createProfile)

module.exports = router