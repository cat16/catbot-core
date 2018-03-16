import { Command } from '../../../index'

export default (bot) => {
  return new Command({
    name: 'sudo',
    defaultPermission: true,
    silent: true,
    run: async (msg, content, bot) => {
      if (msg.author.id === bot.config.ownerID || (await bot.userManager.getAdmin(msg.author.id))) {
        bot.commandManager.runResult(
          bot.commandManager.parseContent(content, bot.commandManager.elements, bot.commandManager.find('sudo').element),
          msg,
          true
        )
      } else {
        if (!bot.get('silent', false)) bot.client.createMessage(msg.channel.id, ':lock: Only admins of this bot may use this')
      }
    }
  })
}
