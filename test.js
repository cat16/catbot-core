process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
})

let Bot = require('./bot.js')
let bot = new Bot(__dirname)
bot.start()
