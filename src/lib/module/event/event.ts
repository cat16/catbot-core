import Bot from '../../bot'
import { Element } from '../../handler'

export enum EventType {
  Client
}

export interface EventOptions {
  name: string
  type: EventType
}

export default abstract class Event implements Element {

  name: string
  type: EventType

  constructor (options: EventOptions) {
    this.name = options.name
    this.type = options.type
  }

  abstract run(bot: Bot, ...args): void

  getTriggers(): string[] {
    return [name]
  }
}
