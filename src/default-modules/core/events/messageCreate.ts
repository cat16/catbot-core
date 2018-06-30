import { Event, Bot, EventType, EventConstructionData } from '../../../index'
import { Message } from 'eris'

export default class extends Event {
  constructor(data: EventConstructionData) {
    super(data, {
      event: 'messageCreate',
      type: EventType.Bot
    })
  }
  run (bot: Bot, msg: Message) {
    if (msg.author.id === bot.client.user.id) return
    if (msg.author.bot && !bot.get('disableBotInput', false)) return
    bot.getMainModule().commandManager.handleMessage(msg)
  }
}
