process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
})

import { Catbot } from '../index'
let bot = new Catbot(__dirname)
bot.start()
