const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
  chat_id: {
    type: Number,
    required: true,
    index: true,
    trim: true,
  },
  sessions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},{ timestamps: true});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;