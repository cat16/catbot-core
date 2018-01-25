const eris = require('eris')
const Message = eris.Message // eslint-disable-line no-unused-vars

const Logger = require('./logger.js')

/**
 * @param {Message} msg
 * @param {string} content
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
    this.run = (msg, content, bot) => {
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

module.exports = Command
