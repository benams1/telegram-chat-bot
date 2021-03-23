const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const {
  constantStrings: {
    session : {
      OPEN,
      CLOSE,
    },
    senders: {
      USER,
      BOT,
    },
  }
} = require('../constants')


const sessionSchema = mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum : [ OPEN, CLOSE ],
    default: OPEN
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
  },
  messages: [
    {
      message_id: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4,
      },
      content: {
        type: String,
      },
      sender: {
        type: String,
        required: true,
        enum : [ BOT, USER ],
      },
      timestamp: {
        type: Date,
        required: true,
        default: Date.now,
      }
    }
  ],
},{ timestamps: true});
const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;