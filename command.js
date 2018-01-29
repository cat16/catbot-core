const eris = require('eris')
const Message = eris.Message // eslint-disable-line no-unused-vars

const Logger = require('./logger.js')
const Catbot = require('./bot.js') // eslint-disable-line no-unused-vars
const Arg = require('./arg.js')

/**
 * @param {Message} msg
 * @param {string | object} content
 * @param {Catbot} bot
 */
const RunFunction = (msg, content, bot) => { } // eslint-disable-line no-unused-vars

class Command {
  /**
   * @typedef CommandOptions
   * @property {string} name
   * @property {RunFunction} run
   * @property {string[]} [aliases]
   * @property {Command[]} [subcommands]
   * @property {boolean} [defaultPermission]
   * @property {string[]} [defaultTags]
   * @property {Arg[]} [args]
   */

  /**
   * @param {CommandOptions} options
   */
  constructor (options) {
    this.name = options.name

    /**
     * @param {Message} msg
     * @param {string} content
     * @param {Catbot} bot
     * @return {Promise}
     */
    this.run = options.run == null ? null : (msg, content, bot) => {
      return new Promise((resolve, reject) => {
        try {
          /** @type {Promise} */
          let result = options.run(msg, content, bot)
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
    this.aliases = options.aliases || []
    this.subcommands = options.subcommands || false
    this.defaultPermission = options.defaultPermission == null ? false : options.defaultPermission
    this.defaultTags = options.defaultTags || []
    this.args = options.args || []
  }

  getTriggers () {
    return this.aliases.concat(this.name)
  }

  /**
   * @param {Logger} logger
   */
  prepare (logger) {
    this.logger = new Logger(`command::'${this.name}'`, logger)
  }
}

Command.Arg = Arg

module.exports = Command
