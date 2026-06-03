const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    roomId: String,
    username: String,
    text: String,
    replies: [{ username: String, text: String }],
    thumbsUp: { type: Number, default: 0 },
    thumbsDown: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
