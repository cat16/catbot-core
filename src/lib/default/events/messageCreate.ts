import { Event } from '../../../index'
import { Message } from 'eris';

export default (bot) => {
  return new Event({
    run: (msg: Message, bot) => {
      if (msg.author.id === bot.client.user.id) return
      if (msg.author.bot && !bot.get('disableBotInput', false)) return
      bot.commandManager.handleMessage(msg)
    }
  })
}
