import { ElementLoader, FlatElementManager } from '../handler'
import Logger from '../../util/logger'
import Event from './event'
import { Bot } from '../../..';

export class EventLoader extends ElementLoader<Event> {

  bot: Bot

  constructor(bot: Bot) {
    super()
    this.bot = bot
  }
}

export class EventManager extends FlatElementManager<Event> {

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
