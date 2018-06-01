import { Command, CommandConstructionData, CommandContext } from '../../index'

const CODE_LENGTH = 1900

export default class extends Command {
  constructor(data: CommandConstructionData) {
    super(data, {
      name: 'show code',
      aliases: ['share', 'share code']
    })
  }
  async run (context: CommandContext) {
    let path = context.args.content
    /** @type {string} */
    let code = require(path).toString()
    for (let i = 0; i < code.length; i += CODE_LENGTH) {
      let start = i
      let end = i + CODE_LENGTH
      if (code.substring(end).length > 0) while (code.substring(end, end + 1) !== '\n') end--
      context.bot.client.createMessage(context.msg.channel.id, `\`\`\`js\n${code.substring(start, end)}\n\`\`\``)
      i -= end - CODE_LENGTH - i
    }
  }
}
