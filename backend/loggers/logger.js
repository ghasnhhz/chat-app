// logger.js

const winston = require('winston')

const options = {
 console: {
 level: 'debug',
 handleExceptions: true,
 json: false,
 colorize: true
 },
 logsene: {
 token: process.env.LOGS_TOKEN,
 level: 'debug',
 type: 'app_logs',
 url: 'https://logsene-receiver.sematext.com/_bulk'
 }
}

const logger = winston.createLogger({
 levels: winston.config.npm.levels,
 transports: [
 new winston.transports.Console(options.console)
 ],
 exitOnError: false
})

module.exports = logger