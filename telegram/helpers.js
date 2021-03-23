const telegramBotClient = require('node-telegram-bot-api');
const { telegramBotToken: token } = require('../config')
const {
  handleStartMessage,
  handleFreeTextMessage,
  handleGetInfoMessage,
  handleEndMessage,
  handleFallbackMessage,
} = require('./handlers')

const createBotInstance = () => {
  try {
    return new telegramBotClient(token, { polling: true });
  }
  catch(error) {
    console.log(`can't create telegram bot instance :`, error)
    return null
  }
};
const bindHandlers = (telegramBot) => {
  telegramBot.on('message', messageHandler(telegramBot));
};
const messageHandler = (telegramBot) => {
  return (message) => {
    const {chat: { id: chatId } = {}, text = '' } = message || {};
    if (text.toLowerCase().startsWith('/start')) {
      handleStartMessage(message, telegramBot);
    }
    else if (text.toLowerCase().startsWith('/freetext')) {
      handleFreeTextMessage(message, telegramBot);
    }
    else if (text.trim() === '/getinfo') {
      handleGetInfoMessage(message, telegramBot);
    }
    else if (text.trim() === '/end') {
      handleEndMessage(message, telegramBot);
    }
    else {
      handleFallbackMessage(message, telegramBot);
    }
  }
};
module.exports = {
  createBotInstance,
  bindHandlers,
}