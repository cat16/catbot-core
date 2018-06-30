import Bot from '../../bot'

export class ArgOptions {
  name: string
  types?: ArgType[]
}

export default class Arg {

  name: string
  types: ArgType[]

  constructor(options: ArgOptions) {
    this.name = options.name
    this.types = options.types || [ ArgType.ANY ]
  }
}

export class ArgResult {

  failed: boolean
  data: string | object
  subcontent?: string

  constructor(failed: boolean, data: string | object, subcontent?: string) {
    this.failed = failed
    this.data = data
    this.subcontent = subcontent
  }
}

export type ValidateFunction = (text: string, bot: Bot) => ArgResult

export class ArgTypeOptions {
  validate: ValidateFunction
}

export class ArgType {

  validate: ValidateFunction

  constructor(options: ArgTypeOptions) {
    this.validate = options.validate
  }

  static ANY = new ArgType({
    validate: (text, bot) => {
      let word = text.split(' ')[0]
      return new ArgResult(false, word, text.substring(word.length).trimLeft())
    }
  })
  static USER = new ArgType({
    validate: (text, bot) => {
      let parts = text.split(/ (.+)/)
      let user = bot.util.getUser(parts[0])
      if (user) return new ArgResult(false, user, parts[1])
      else return new ArgResult(true, `User ${parts[0]} does not exist or cannot be found`)
    }
  })
  static TEXT_CHANNEL = new ArgType({
    validate: (text, bot) => {
      let parts = text.split(/ (.+)/)
      let channel = bot.util.getTextChannel(parts[0])
      if (channel) return new ArgResult(false, channel, parts[1])
      else return new ArgResult(true, `Text channel ${parts[0]} does not exist or cannot be found`)
    }
  })
  static DM_CHANNEL = new ArgType({
    validate: (text, bot) => {
      let parts = text.split(/ (.+)/)
      let channel = bot.util.getDMChannel(parts[0])
      if (channel) return new ArgResult(false, channel, parts[1])
      else return new ArgResult(true, `DM channel ${parts[0]} does not exist or cannot be found`)
    }
  })
  static VOICE_CHANNEL = new ArgType({
    validate: (text, bot) => {
      let parts = text.split(/ (.+)/)
      let channel = bot.util.getVoiceChannel(parts[0])
      if (channel) return new ArgResult(false, channel, parts[1])
      else return new ArgResult(true, `Voice channel ${parts[0]} does not exist or cannot be found`)
    }
  })
  static COMMAND = new ArgType({
    validate: (text, bot) => {
      let result = bot.getCommandManager().find(text)
      if (result) {
        return new ArgResult(false, result.data.element, result.remaining)
      } else {
        return new ArgResult(true, `'${text}' is not a command`)
      }
    }
  })
}
