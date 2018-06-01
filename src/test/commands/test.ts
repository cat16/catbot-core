import { Command, CommandConstructionData, CommandContext } from '../../index'

export default class extends Command {
  constructor(data: CommandConstructionData) {
    super(data, {
      name: 'test command',
      aliases: ['test']
    })
  }
  async run (context: CommandContext) {
    let commandManager = context.bot.getMainModule().commandManager
    commandManager.runResult(
      commandManager.parseContent(context.args.content, commandManager.elements),
      context.msg
    )
    context.bot.temp.testCommand.userMap[context.msg.author.id] = context.args.content
  }
}
