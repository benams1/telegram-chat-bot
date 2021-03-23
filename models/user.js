const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email');
      }
    },
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
  },
},{ timestamps: true});

/**
 *
 * @param email
 * @returns {Promise<*>}
 */
userSchema.statics.isUserExist = (email) => {
  return User.findOne({ email });
};

const User = mongoose.model('User', userSchema);

module.exports = User;