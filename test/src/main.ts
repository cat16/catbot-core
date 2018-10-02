process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
})

import { Bot, getInput } from '../../src'
let a = async function () {
  console.log('Input the following:')
  let bot = new Bot(__dirname, {
    uri: await getInput('database URI:'),
    user: await getInput('database user:'),
    password: await getInput('database password:'),
  })
  bot.start()
}()