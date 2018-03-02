const { Command } = require('../../index.js')

const CODE_LENGTH = 1900

module.exports = (bot) => {
  return new Command({
    name: 'show code',
    aliases: ['share', 'share code'],
    run: async (msg, content, bot) => {
      let path = content
      /** @type {string} */
      let code = require(path).toString()
      for (let i = 0; i < code.length; i += CODE_LENGTH) {
        let start = i
        let end = i + CODE_LENGTH
        if (code.substring(end).length > 0) while (code.substring(end, end + 1) !== '\n') end--
        bot.client.createMessage(msg.channel.id, `\`\`\`js\n${code.substring(start, end)}\n\`\`\``)
        i -= end - CODE_LENGTH - i
      }
    }
  })
}
