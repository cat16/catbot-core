const { Command, eris } = require('../../core.js')
const Message = eris.Message // eslint-disable-line no-unused-vars
const util = require('util')

module.exports = (bot) => {
  let prepareCode = (code) => {
    return code.toString().replace(bot.config.token, '[TOKEN]').slice(0, 1000)
  }

  const depth = 0

  /**
   * @param {Message} msg
   * @param {Promise<Message>} sending
   * @param {string} input
   * @param {any} data
   */
  let handleOutput = async (msg, sending, input, data) => {
    let output = data
    if (typeof (output) !== 'string') {
      output = util.inspect(data, { depth })
    }
    let type =
      data === null ? 'null'
        : data === undefined ? 'undefined'
          : typeof (data) === 'object' ? 'object - ' + data.constructor.name
            : typeof (data)
    let promise = output.startsWith('Promise {')
    sending.then(sent => {
      let sending2 = sent.edit({
        content: '',
        embed: {
          fields: [
            {
              name: 'Input',
              value: '```js\n' + input + '```'
            },
            {
              name: 'Output',
              value: '```js\n' + prepareCode(output) + '```'
            },
            {
              name: 'Type',
              value: '```js\n' + type + '```'
            }
          ],
          timestamp: new Date(),
          color: promise ? 0xffff00 : 0x00ff00
        }
      })
      if (promise) {
        data.then(newData => {
          handleOutput(msg, sending2, input, newData)
        }, (err) => {
          outputError(sending2, input, err)
        })
      }
    })
  }

  /**
   * @param {Message} sending
   * @param {string} input
   * @param {Error} err
   */
  let outputError = async (sending, input, err) => {
    (await sending).edit({
      content: '',
      embed: {
        fields: [
          {
            name: 'Input',
            value: '```js\n' + input + '```'
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
        timestamp: new Date(),
        color: 0xff0000
      }
    })
  }

  return new Command({
    name: 'eval',
    run: async (msg, content, bot) => {
      let sending = bot.client.createMessage(msg.channel.id, 'Processing...')
      try {
        Promise.resolve(eval(content)).then(data => { // eslint-disable-line no-eval
          handleOutput(msg, sending, content, data)
        }, err => {
          outputError(sending, content, err)
        })
      } catch (ex) {
        outputError(sending, content, ex)
      }
    }
  })
}
