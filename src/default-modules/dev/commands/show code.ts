import { Command, CommandConstructionData, CommandContext } from '../../..'

const CODE_LENGTH = 1900

export default class extends Command {
  constructor(data: CommandConstructionData) {
    super(data, {
      name: 'show code'
    })
  }
  async run (context: CommandContext) {
    let path = context.args.content
    let code = require(path).toString()
    for (let i = 0; i < code.length; i += CODE_LENGTH) {
      let start = i
      let end = i + CODE_LENGTH
      if (code.substring(end).length > 0) while (code.substring(end, end + 1) !== '\n') end--
      context.say(`\`\`\`js\n${code.substring(start, end)}\n\`\`\``)
      i -= end - CODE_LENGTH - i
    }
  }
}
