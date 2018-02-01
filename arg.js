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
      let parts = text.split(/ (.+)/)
      let user = bot.util.getUser(parts[0])
      if (user) return new ArgResult(false, user, parts[1])
      else return new ArgResult(true, `User ${parts[0]} does not exist or cannot be found`)
    }
  }),
  text_channel: new ArgType({
    validate: (text, bot) => {
      let parts = text.split(/ (.+)/)
      let channel = bot.util.getTextChannel(parts[0])
      if (channel) return new ArgResult(false, channel, parts[1])
      else return new ArgResult(true, `Text channel ${parts[0]} does not exist or cannot be found`)
    }
  }),
  dm_channel: new ArgType({
    validate: (text, bot) => {
      let parts = text.split(/ (.+)/)
      let channel = bot.util.getDMChannel(parts[0])
      if (channel) return new ArgResult(false, channel, parts[1])
      else return new ArgResult(true, `DM channel ${parts[0]} does not exist or cannot be found`)
    }
  }),
  voice_channel: new ArgType({
    validate: (text, bot) => {
      let parts = text.split(/ (.+)/)
      let channel = bot.util.getVoiceChannel(parts[0])
      if (channel) return new ArgResult(false, channel, parts[1])
      else return new ArgResult(true, `Voice channel ${parts[0]} does not exist or cannot be found`)
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
