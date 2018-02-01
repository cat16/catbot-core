const Command = require('../../core.js').Command

module.exports = (bot) => {
  return new Command({
    name: 'sudo',
    defaultPermission: true,
    silent: true,
    run: (msg, content, bot) => {
      if (msg.author.id === bot.config.ownerID) {
        bot.commandManager.run(
          bot.commandManager.parseContent(content, bot.commandManager.commands, ['sudo']),
          msg,
          true
        )
      } else {
        bot.client.createMessage(msg.channel.id, ':lock: Only the owner of this bot may use this')
      }
    }
  })
}
