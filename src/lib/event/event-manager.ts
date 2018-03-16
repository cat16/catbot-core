import Handler, { ElementSearchResult } from '../handler'
import load from '../util/load'
import Logger from '../util/logger'
import Event from './event'
import Catbot from '../bot'

export default class EventManager extends Handler<Event> {
  push(event: Event): Promise<void> {
    return new Promise((resolve, reject) => {
      this.elements.push(event)
      this.bot.client.on(event.fileName, data => {event.run(data, this.bot)})
      resolve()
    })
  }

  find(content: string): ElementSearchResult<Event> {
    return { element: this.elements.find(e => e.fileName === content), content }
  }

  constructor(bot: Catbot) {
    super(bot, new Logger('event-manager', bot.logger), 'event')
  }
}
