const logger = require("../loggers/logger")

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack)

  if (res.headersSent) {
    return next(err)
  }

  const statusCode = err.statusCode || 500
  const message = err.message || "Internal server error"
  res.status(statusCode).json({ 
    message
  })
}

module.exports = errorHandler