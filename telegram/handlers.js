const User = require('../models/user');
const Chat = require('../models/chat');
const Session = require('../models/session');
const { botMessages } = require('../constants');
const getQuote = require('../utils/kanye.rest');
const {
  constantStrings: {
    session: {
      OPEN,
      CLOSE,
    },
    senders: {
      USER,
      BOT,
    },
  },
} = require('../constants');

//helpers

const createChat = (chat_id, user, sessions = []) => new Chat({chat_id, user, sessions});
const createSession = (chat, messages = [] ) => new Session({chat, messages});
const createUser = (first_name, last_name, email ) => new User({ first_name, last_name, email });
const populatedUser = (email) => User.isUserExist(email).populate([
  {
    path: 'chat',
    model: 'Chat',
    populate: {
      path: 'sessions',
      model: 'Session',
    }
  }
]);

const findChatByIdOpenSession = (chat_id) =>   Chat.findOne({ chat_id })
  .populate({
    path: 'sessions',
    match: { status: OPEN }
  });

const findChatByIdAllSessions = (chat_id) =>   Chat.findOne({ chat_id }).populate('sessions');

const buildMessageObj = (content, sender, message_id = null, unixTimestamp = null) => {
  const obj = {
    content,
    sender,
  };

  if (message_id) obj.message_id = message_id;
  if (unixTimestamp) obj.timestamp = unixTimestamp * 1000;

  return obj
};

const createNewUser = async ({ first_name, last_name, email, chat_id , msgObj }) => {
  // create User
  const user = createUser(first_name, last_name, email);
  await user.save();
  // create Chat
  const chat = createChat(chat_id, user._id)
  await chat.save();
  // create Session
  const messages = [ msgObj ];
  const session = createSession(chat._id, messages)
  await session.save()

  //update chat
  chat.user = user._id;
  chat.sessions.push(session._id);

  // update user
  user.chat = chat._id;
  // save user and chat data
  await Promise.all([chat.save(), user.save()]);
  return session;
};

const validateChatOpenSessionModel = (chat, chat_id) => {
  if (!chat) {
    sendMessage(telegramBot, chat_id, botMessages.unknownChat);
    return false
  }
  if (!chat.sessions || !chat.sessions.length) {
    sendMessage(telegramBot, chat_id, botMessages.youDidntActive);
    return false;
  }
  return true;
};

//handlers

const handleStartMessage = async (message, telegramBot) => {
  const {chat: { id: chat_id, first_name, last_name } = {},  message_id, text = '', date: timestamp } = message || {};
  const email = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (!email) {
    sendMessage(telegramBot, chat_id, botMessages.invalidEmail);
    return;
  }
  populatedUser(email[0])
    .then(async (user) => {
      const msgObj = buildMessageObj(text, USER, message_id, timestamp);
      let session;
      if (!user) {
        session = await createNewUser({ first_name, last_name, email: email[0], chat_id, msgObj });
      } else {
        session = await Session.create({
          chat: user.chat._id,
          messages: [ msgObj ],
        });
        user.chat.sessions.push(session._id)
        user.chat.save()
      }
      sendMessage(telegramBot, chat_id, botMessages.start, session)
    }).catch(e => console.log('error', e));
};

const handleFreeTextMessage = (message, telegramBot) => {
  const {chat: { id: chat_id } = {},  message_id, text = '', date: timestamp } = message || {};
  findChatByIdOpenSession(chat_id)
    .then(async chat => {
      if (!validateChatOpenSessionModel(chat, chat_id)) {
        return ;
      }
      const response = await getQuote()
      if (!response || !response.data || !response.data.quote) {
        return sendMessage(telegramBot, chat_id, botMessages.internalError);
      }
      chat.sessions[0].messages.push(buildMessageObj(text, USER, message_id, timestamp));
      sendMessage(telegramBot, chat_id, botMessages.freeText(response.data.quote), chat.sessions[0]);
    })
    .catch(e => console.log('error', e))
};

const handleGetInfoMessage = (message, telegramBot) => {
  const {chat: { id: chat_id } = {},  message_id, text = '', date: timestamp } = message || {};
  findChatByIdAllSessions(chat_id)
    .then(async (chat) => {
      if (!chat) {
        return sendMessage(telegramBot, chat_id, botMessages.unknownChat);
      }
      /**
        use reverse is for better performance:
        since we are using push the open session located probably in the end of the sessions array
      */
      const openSession = chat.sessions && chat.sessions.reverse().find(session => session.status === OPEN);

      if (!openSession) {
        return sendMessage(telegramBot, chat_id, botMessages.youDidntActive);
      }

      const time = [];
      let messagesCounter = 1;

      chat.sessions.forEach(session  => {
        if (session.status === CLOSE) {
          const start = session.messages.find(m => m.content.startsWith('/start'));
          const end = session.messages.reverse().find(m => m.content.startsWith('/end'));
          if (start && end) {
            time.push(Math.abs(end.timestamp - start.timestamp))
          }
        }
        messagesCounter += session.messages.filter(m => m.sender === USER).length
      });
      const totalTime = (time.reduce((sum, cur) => sum + cur ,0))
      const averageInMilli = time.length ? totalTime / time.length : 0 ;
      openSession.messages.push(buildMessageObj(text, USER, message_id, timestamp))
      sendMessage(telegramBot, chat_id, botMessages.getInfo(averageInMilli, messagesCounter),openSession)
    })
    .catch(e => console.log('error', e));
};

const handleEndMessage = (message, telegramBot) => {
  const {chat: { id: chat_id } = {},  message_id, text = '', date: timestamp } = message || {};
  findChatByIdOpenSession(chat_id)
    .then(async chat => {
      if (!validateChatOpenSessionModel(chat, chat_id)) {
        return ;
      }
      chat.sessions[0].messages.push(buildMessageObj(text, USER, message_id, timestamp))
      sendMessage(telegramBot, chat_id, botMessages.end, chat.sessions[0], true);
    })
    .catch(e => console.log('error', e));
};
const handleFallbackMessage = (message, telegramBot) => {
  const {chat: { id: chat_id } = {} } = message || {};

  sendMessage(telegramBot, chat_id, botMessages.sorryIDidnt);
};

const sendMessage = (telegramBot, chatId, message, sessionModel = null, closeSession = false) => {
  telegramBot.sendMessage(chatId, message);
  if (sessionModel){
    sessionModel.messages.push(buildMessageObj(message,BOT));
    if (closeSession) sessionModel.status = CLOSE
    sessionModel.save();
  }
}

module.exports = {
  handleStartMessage,
  handleFreeTextMessage,
  handleGetInfoMessage,
  handleEndMessage,
  handleFallbackMessage,
};