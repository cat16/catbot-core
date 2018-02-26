const { Command } = require('../../core.js')

module.exports = (bot) => {
  return new Command({
    name: 'restart',
    run: async (msg, content, bot) => {
      let sentp = bot.client.createMessage(msg.channel.id, 'Restarting...')
      await bot.restart()
      sentp.then(sent => sent.edit(':white_check_mark: Successfully restarted'))
    }
  })
}
