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
   * @property {string} name - the name of the command
   * @property {RunFunction} run - the function to be executed when the command is successfully detected and requirements fufilled
   * @property {string[]} [aliases] - more names for the command
   * @property {Command[]} [subcommands] - subcommands of this command; use instead of arguements if you want to do completely different things
   * @property {boolean} [defaultPermission] - whether the command should be usable by everyone; tags restrict use rather than enable
   * @property {string[]} [defaultTags] - tags you want this command to start with; they can enable and disable use based on what tags the user has
   * @property {Arg[]} [args] - arguements; information the user needs to add after the command in order for it to work
   * @property {boolean} [silent] - whether or not to log that this command was ran
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
    this.silent = options.silent || false
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
