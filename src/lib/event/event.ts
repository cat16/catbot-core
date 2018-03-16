import { Message } from 'eris'
import Catbot from '../bot'
import { Element } from '../handler'

export type BotEventFunction = (data: any, bot: Catbot) => Promise<void> | void

export interface BotEventOptions {
  run: BotEventFunction
}

export default class BotEvent implements Element {

  fileName: string
  path: string
  isDefault: boolean

  getAllElements() {
    return [this]
  }

  runFunc: BotEventFunction

  constructor (options: BotEventOptions) {
    this.runFunc = options.run
  }

  run (data: any, bot: Catbot): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.runFunc == null) {
        reject(new Error('no run function provided'))
        return
      }
      try {
        let result = this.runFunc(data, bot)
        if (result instanceof Promise) {
          result.then(() => {
            resolve()
          }, (reason) => {
            reject(reason)
          })
        } else {
          resolve()
        }
      } catch (ex) {
        reject(ex)
      }
    })
  }
}
