import { Command } from '../../index'

export default (bot) => {
  bot.temp.testCommand = { userMap: {} }
  return new Command({
    name: 'test command',
    aliases: ['test'],
    run: async (msg, content, bot) => {
      bot.commandManager.runResult(
        bot.commandManager.parseContent(content, bot.commandManager.elements),
        msg
      )
      bot.temp.testCommand.userMap[msg.author.id] = content
    },
    subcommands: [
      new Command({
        name: 'again',
        run: async (msg, content, bot) => {
          let temp = bot.temp.testCommand
          if (temp.userMap[msg.author.id] == null) {
            bot.client.createMessage(msg.channel.id, 'No previous commands were tested')
          } else {
            bot.restart(true).then(() => {
              bot.temp.testCommand = temp
              bot.commandManager.runResult(
                bot.commandManager.parseContent(temp.userMap[msg.author.id]),
                msg
              )
            }, (err) => {
              bot.client.createMessage(msg.channel.id, err)
            })
          }
        }
      })
    ]
  })
}
