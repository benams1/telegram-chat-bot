module.exports = {
    botMessages: {
        start: 'Hi, how can i help you today?\n' +
          'I\'m the test chat bot please select one of the options below:\n' +
          '/freetext <text> :\n' +
          'this option will return a random sentence from api service.\n' +
          '/getinfo :\n' +
          'this option will return statistics about user\'s conversations.\n' +
          '/end :\n' +
          'this option will end up the current conversation.',
        freeText: (quote) => `quote: ${quote}`,
        getInfo: (timeInMilliSec, numberOfMessages) => `The average session time is ${Math.floor(timeInMilliSec / 60000)} minutes and ${((timeInMilliSec % 60000) / 1000).toFixed(0)} seconds.\n` +
        `and you (the user) sent ${numberOfMessages} messages including the last getinfo message.`,
        end: 'OK, we are done here',
        internalError: 'Sorry I have an internal error.',
        sorryIDidnt: 'Sorry, I didn\'t get that.',
        youDidntActive: 'Sorry I didn\'t find active session.',
        invalidEmail: 'The email you typed is invalid please try again',
        unknownChat: 'sorry but I don\'t know please sign up using /start <your email> '
    },
    constantStrings: {
        session: {
            OPEN: 'open',
            CLOSE: 'close',
        },
        senders: {
            USER: 'user',
            BOT: 'bot',
        },
    }
};