module.exports = {
    port: process.env.PORT || 5000,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    mongoose: {
      DB_URL: process.env.MONGO_URL,
      options: {
          useCreateIndex: true,
          useNewUrlParser: true,
          useUnifiedTopology: true,
      }
    },
  kanyeRest: {
    url: 'https://api.kanye.rest/',
  },
};