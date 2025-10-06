const express = require("express")
const { register, login, logout } = require("../controllers/authController")
const {refresh} = require("../controllers/refreshController")
const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/refresh", refresh)

module.exports = router