import { Command } from '../../../index'

export default (bot) => {
  return new Command({
    name: 'bot',
    subcommands: [
      new Command({
        name: 'restart',
        run: async (msg, content, bot) => {
          let sentp = bot.client.createMessage(msg.channel.id, 'Restarting...')
          await bot.restart()
          sentp.then(sent => sent.edit(':white_check_mark: Successfully restarted'))
        },
        subcommands: [
          new Command({
            name: 'full',
            run: async (msg, content, bot) => {
              let sentp = bot.client.createMessage(msg.channel.id, 'Restarting...')
              await bot.restart(true)
              sentp.then(sent => sent.edit(':white_check_mark: Successfully restarted'))
            }
          })
        ]
      }),
      new Command({
        name: 'invite',
        run: async (msg, content, bot) => {
          bot.client.createMessage(msg.channel.id, `Invite: https://discordapp.com/oauth2/authorize?client_id=${bot.client.user.id}&permissions=0&scope=bot`)
        }
      }),
      new Command({
        name: 'stop',
        run: async (msg, content, bot) => {
          await bot.client.createMessage(msg.channel.id, 'Stopping...')
          bot.stop()
        }
      })
    ]
  })
}
