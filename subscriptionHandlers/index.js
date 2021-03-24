const Chat = require('../models/chat')
const connections = {};
const { constantStrings: {session: {OPEN}} } = require('../constants');
const onConnect = (socket) => {
  const { handshake: { query: { chat_id } = {} } = {} } = socket
  if (chat_id) {
    connections[chat_id] = socket;
    sendHistoryMessages(chat_id, socket);
    socket.on('disconnect', (reason) => {
      delete connections[chat_id];
    })
  }
};
const sendHistoryMessages = (chat_id, socket) => {
  Chat.findOne({ chat_id })
    .populate({
      path: 'sessions',
      match: { status: OPEN }
    })
    .then(chat => {
      if (!chat || !chat.sessions || !chat.sessions.length) {
        return socket.emit('message', { error: 'no active session or chat'});
      }
      socket.emit('message', { type: 'historyMessages', messages: chat.sessions[0].messages });
    })
    .catch(e => console.log('error', e));
};

const notifySubscribers = (chat_id, messageObj) => {
  if (connections[chat_id]) {
    connections[chat_id].emit('message', { type: 'newMessage', message: messageObj })
  }
};

module.exports = {
  onConnect,
  notifySubscribers,
};
