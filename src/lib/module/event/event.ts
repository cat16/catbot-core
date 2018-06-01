import { Message } from 'eris'
import Catbot from '../../bot'
import { Element, ElementConstructionData } from '../element'

export interface EventConstructionData extends ElementConstructionData {
  bot: Catbot
}

export enum EventType {
  Bot
}

export interface EventOptions {
  event: string
  type: EventType
}

export default abstract class Event extends Element {

  getAllElements() {
    return [this]
  }

  getAliases() {
    return []
  }

  getName() {
    return this.path.split('/').pop().split('.')[0]
  }

  abstract run(bot: Catbot, ...args): void

  name: string
  type: EventType

  constructor (data: EventConstructionData, options: EventOptions) {
    super(data)
    this.name = options.event
    this.type = options.type
  }
}
