const Command = require('../bot.js').Command
const util = require('util')

module.exports = (bot) => {
  let prepareCode = (code) => {
    return code.toString().replace(bot.config.token, '[TOKEN]').slice(0, 1000)
  }

  return new Command(
    'eval',
    async (msg, args, bot) => {
      const depth = 0
      const content = args.join(' ')
      try {
        let evaled = eval(content) // eslint-disable-line no-eval
        let output = evaled
        if (typeof (output) !== 'string') {
          output = util.inspect(output, { depth })
        }
        let type = typeof (evaled) === 'object' ? 'object - ' + evaled.constructor.name : typeof (evaled)
        let sent = bot.client.createMessage(msg.channel.id, {
          embed: {
            fields: [
              {
                name: 'Input',
                value: '```js\n' + content + '```'
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
            timestamp: new Date()
          }
        })

        if (output === 'Promise { <pending> }') {
          /** @type {Promise} */
          let promise = evaled

          let editOutput = async result => {
            let code = util.inspect(result, { depth }).replace(bot.config.token, '[TOKEN]')

            sent.then(msg2 => {
              msg2.edit({
                embed: {
                  fields: [
                    {
                      name: 'Input',
                      value: '```js\n' + content + '```'
                    },
                    {
                      name: 'Output',
                      value: '```js\n' + prepareCode(code) + '```'
                    },
                    {
                      name: 'Type',
                      value: '```js\n' + result.constructor.name + '```'
                    }
                  ],
                  timestamp: new Date()
                }
              })
            })
          }

          promise.then(editOutput, editOutput)
        }
      } catch (ex) {
        bot.client.createMessage(msg.channel.id, {
          embed: {
            fields: [
              {
                name: 'Input',
                value: '```js\n' + content + '```'
              },
              {
                name: 'Exception',
                value: '```js\n' + ex.message + '```'
              },
              {
                name: 'Stack',
                value: '```js\n' + ex.stack + '```'
              },
              {
                name: 'Type',
                value: '```js\n' + ex.name + '```'
              }
            ],
            timestamp: new Date()
          }
        })
      }
    },
    {
      requirements: {
        userIDs: [
          bot.config.ownerID
        ]
      }
    }
  )
}
