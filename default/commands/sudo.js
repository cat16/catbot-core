const { Command } = require('../../core.js')

module.exports = (bot) => {
  return new Command({
    name: 'sudo',
    defaultPermission: true,
    silent: true,
    run: async (msg, content, bot) => {
      if (msg.author.id === bot.config.ownerID || (await bot.userManager.getAdmin(msg.author.id))) {
        bot.commandManager.runResult(
          bot.commandManager.parseContent(content, bot.commandManager.commands, ['sudo']),
          msg,
          true
        )
      } else {
        if (!bot.config.silent) bot.client.createMessage(msg.channel.id, ':lock: Only admins of this bot may use this')
      }
    }
  })
}
