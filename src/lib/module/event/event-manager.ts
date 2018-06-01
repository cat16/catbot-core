import { ElementHandler, ElementSearchResult } from '../handler'
import Logger from '../../util/logger'
import Event from './event'
import { Catbot } from '../../..';

export default class EventManager extends ElementHandler<Event> {

  bot: Catbot

  constructor(bot: Catbot, logger?: Logger) {
    super(new Logger('event-manager', logger), 'event')
    this.bot = bot
  }
}
