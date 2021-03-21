const { createBotInstance, bindHandlers } = require('./helpers')
const telegramBot = createBotInstance();

if (!telegramBot) throw new Error('cant create telegram bot instance');

bindHandlers(telegramBot);

