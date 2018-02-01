const Command = require('../../core.js').Command

module.exports = (bot) => {
  return new Command({
    name: 'ping',
    defaultPermission: true,
    run: (msg, content, bot) => {
      let now = new Date()
      bot.client.createMessage(msg.channel.id, 'Ping: loading...').then(sent => {
        let then = new Date()
        sent.edit(`Ping: ${then.getTime() - now.getTime()}ms`)
      })
    }
  })
}
