import { Command, CommandContext, CommandConstructionData } from '../../../../index'
import { Message } from 'eris'
import * as util from 'util'

const depth = 0

export default class extends Command {
  constructor(data: CommandConstructionData) {
    super(data, {
      name: 'eval'
    })
  }
  async run(data: CommandContext) {
    let sending = data.say('Processing...')
    try {
      let result = await eval(data.args.content)
      let output = result
      if (typeof (output) !== 'string') {
        output = util.inspect(result, { depth })
      }
      let type =
        result === null ? 'null'
          : result === undefined ? 'undefined'
            : typeof (result) === 'object' ? 'object - ' + result.constructor.name
              : typeof (result)
      let promise = output.startsWith('Promise {')
      let sent = await sending
      sent.edit({
        content: '',
        embed: {
          fields: [
            {
              name: 'Input',
              value: '```js\n' + data.args.content + '```'
            },
            {
              name: 'Output',
              value: '```js\n' + output.replace(data.bot.config.token, '[TOKEN]').slice(0, 1000) + '```'
            },
            {
              name: 'Type',
              value: '```js\n' + type + '```'
            }
          ],
          timestamp: new Date().toDateString(),
          color: promise ? 0xffff00 : 0x00ff00
        }
      })
    } catch (err) {
      let sent = await sending
      sent.edit({
        content: '',
        embed: {
          fields: [
            {
              name: 'Input',
              value: '```js\n' + data.args.content + '```'
            },
            {
              name: 'Exception',
              value: '```js\n' + err.message + '```'
            },
            {
              name: 'Stack',
              value: '```js\n' + err.stack.slice(0, 1000) + '```'
            },
            {
              name: 'Type',
              value: '```js\n' + err.name + '```'
            }
          ],
          timestamp: new Date().toDateString(),
          color: 0xff0000
        }
      })
    }
  }
}