const Catbot = require('./bot.js') // eslint-disable-line no-unused-vars

class Arg {
  /**
   * @typedef ArgOptions
   * @prop {string} name
   * @prop {string} [type]
   */

  /**
   * @param {ArgOptions} options
   */
  constructor (options) {
    this.name = options.name
    this.type = options.type || 'any'
  }
}

class ArgResult {
  /**
   * @param {boolean} failed
   * @param {string | object} data
   * @param {string} [subcontent]
   */
  constructor (failed, data, subcontent) {
    this.failed = failed
    this.data = data
    this.subcontent = subcontent
  }
}

class ArgType {
  /**
   * @typedef ArgTypeOptions
   * @prop {function(string, Catbot) : ArgResult} validate
   */

  /**
   * @param {ArgTypeOptions} options
   */
  constructor (options) {
    this.validate = options.validate
  }
}

Arg.type = {
  user: new ArgType({
    validate: (text, bot) => {
      let parts = text.split(' ', 2)
      text = parts[0]
      if (!text.startsWith('<@') || !text.endsWith('>')) return new ArgResult(true, `'${text}' is not a user`)
      text = text.slice(2, -1)
      let user = bot.client.users.find(u => { return u.id === text })
      if (user) return new ArgResult(false, user, parts[1])
      else return new ArgResult(true, `User ${text} does not exist or cannot be found`)
    }
  }),
  command: new ArgType({
    validate: (text, bot) => {
      let command = bot.commandManager.commands.find(c => {
        return c.getTriggers().find(alias => {
          if (text.startsWith(alias)) {
            text = text.slice(alias.length)
            return true
          }
        }) !== undefined
      })
      if (command) {
        return new ArgResult(false, command, text)
      } else {
        return new ArgResult(true, `'${text}' is not a command`)
      }
    }
  })
}

module.exports = Arg
