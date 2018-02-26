const { Command, Arg } = require('../../core.js')

module.exports = (bot) => {
  return new Command({
    name: 'reset',
    subcommands: [
      new Command({
        name: 'command',
        args: [new Arg({name: 'command', type: 'command'})],
        run: async (msg, args, bot) => {
          /** @type {Command} */
          let command = args.command
          let sentp = bot.client.createMessage(msg.channel.id, `Resetting command \`${command.getFullName()}\`...`)
          await command.load(bot.logger, command.commandTable, true)
          sentp.then(sent => sent.edit(`:white_check_mark: Successfully reset command \`${command.getFullName()}\``))
        }
      })
    ]
  })
}
