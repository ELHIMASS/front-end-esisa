const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: String,
  content: String,
  timestamp: String
});

const channelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  messages: [messageSchema]
});

module.exports = mongoose.model('Channel', channelSchema);
