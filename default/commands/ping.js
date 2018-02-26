const { Command } = require('../../core.js')

module.exports = (bot) => {
  return new Command({
    name: 'ping',
    defaultPermission: true,
    run: async (msg, content, bot) => {
      let now = new Date()
      let sent = await bot.client.createMessage(msg.channel.id, 'Ping: loading...')
      let then = new Date()
      sent.edit(`Ping: ${then.getTime() - now.getTime()}ms`)
    }
  })
}
