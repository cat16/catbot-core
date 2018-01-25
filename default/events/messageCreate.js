module.exports = function (msg, bot) {
  if (msg.author.id === bot.client.user.id) return
  bot.commandManager.handle(msg)
}
