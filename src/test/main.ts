process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
})

import { Bot } from '../index'
let bot = new Bot(__dirname)
bot.start()
