const jwt = require("jsonwebtoken")

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    const error = new Error("No token provided")
    error.statusCode = 401
    return next(error)
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    req.user = decoded
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = authenticateToken