const Message = require('../models/Message')

async function getMessages(req, res, next) {
  try {
    const { roomId } = req.params
    
    const messages = await Message.find({ roomId })
      .populate('userId', 'username')
      .sort({ createdAt: 1 })
    
    res.status(200).json({messages})
  } catch (err) {
    next(err)
  }
}

module.exports = {getMessages}