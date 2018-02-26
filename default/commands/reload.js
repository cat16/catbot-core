const { Command } = require('../../core.js')

module.exports = (bot) => {
  return new Command({
    name: 'reload',
    subcommands: [
      new Command({
        name: 'commands',
        run: async (msg, content, bot) => {
          let sentp = bot.client.createMessage(msg.channel.id, 'Reloading all commands...')
          await bot.commandManager.reloadCommands()
          sentp.then(sent => sent.edit(':white_check_mark: Commands reloaded'))
        }
      }),
      new Command({
        name: 'command',
        run: async (msg, content, bot) => {
          let sentp = bot.client.createMessage(msg.channel.id, `Reloading command ${content}...`)
          bot.commandManager.reloadCommand(content).then(() => {
            sentp.then(sent => sent.edit(`:white_check_mark: Command ${content} reloaded`))
          }, (err) => {
            sentp.then(sent => sent.edit(err.message))
          })
        }
      })
    ]
  })
}
