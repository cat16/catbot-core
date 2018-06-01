import { Command, CommandConstructionData, CommandContext, Catbot } from '../../../../index'
import { Message } from 'eris'

export default class extends Command {
  constructor(data: CommandConstructionData) {
    super(data, {
      name: 'sudo',
      silent: true
    })
  }
  async run(context: CommandContext) {
    let bot = context.bot
    let commandManager = bot.getMainModule().commandManager
    let userID = context.msg.author.id
    if (userID === (await bot.client.getOAuthApplication()).owner.id || (await bot.userManager.getAdmin(userID))) {
      commandManager.runResult(
        commandManager.parseContent(
          context.args.content,
          commandManager.elements,
          commandManager.find('sudo').element
        ),
        context.msg,
        true
      )
    } else {
      if (!bot.get('silent', false)) context.say(':lock: Only admins of this bot may use this')
    }
  }
  async hasPermission(context: CommandContext): Promise<boolean> {
      return context.msg.author.id === context.bot.config.ownerID || (await context.bot.userManager.getAdmin(msg.author.id))
  }
}