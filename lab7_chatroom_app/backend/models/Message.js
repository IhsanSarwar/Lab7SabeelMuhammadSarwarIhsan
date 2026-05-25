const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  roomId: String,
  username: String,
  text: String,
  replies: [ { username: String, text: String } ]
});

module.exports = mongoose.model('Message',MessageSchema);