import { ElementManager, FlatElementLoader } from '../handler'
import Logger from '../../util/logger'
import Event from './event'
import { Bot } from '../../..';

export class EventLoader extends FlatElementLoader<Event> {
  constructor(directory: string) {
    super(
      directory,
      (rawElement) => {
        return new rawElement()
      },
      true
    )
  }
}

export class EventManager extends ElementManager<Event> {

  bot: Bot

  constructor(bot: Bot) {
    super()
    this.bot = bot
  }
}
