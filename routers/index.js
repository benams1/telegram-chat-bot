const express = require('express');
const router = express.Router();
const User = require('../models/user')

router.get('/', (req , res) => {
    res.status(200).json({})
 });
router.get('/users', (req , res) => {
  User.find({}).populate('chat')
    .then(users => {
      if (!users) {
        return res.status(200).json([])
      }
      return res.status(200).json(users.map(user => ({ email: user.email, chat_id: user.chat.chat_id })))
    })
    .catch(e => console.log('error', e))
});
module.exports = router;