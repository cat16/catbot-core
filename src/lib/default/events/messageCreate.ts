import { Event } from '../../../index'

export default (bot) => {
  return new Event({
    run: (msg, bot) => {
      if (msg.author.id === bot.client.user.id) return
      bot.commandManager.handleMessage(msg)
    }
  })
}