const { Command, Arg } = require('../../core.js')

module.exports = (bot) => {
  return new Command({
    name: 'command',
    subcommands: [
      new Command({
        name: 'reload',
        run: async (msg, content, bot) => {
          let sentp = bot.client.createMessage(msg.channel.id, `Reloading command ${content}...`)
          bot.commandManager.reloadCommand(content).then(() => {
            sentp.then(sent => sent.edit(`:white_check_mark: Command ${content} reloaded`))
          }, (err) => {
            sentp.then(sent => sent.edit(err.message))
          })
        },
        subcommands: [
          new Command({
            name: 'all',
            run: async (msg, content, bot) => {
              let sentp = bot.client.createMessage(msg.channel.id, 'Reloading all commands...')
              await bot.commandManager.reloadCommands()
              sentp.then(sent => sent.edit(':white_check_mark: Commands reloaded'))
            }
          })
        ]
      }),
      new Command({
        name: 'permission',
        aliases: ['perm', 'perms', 'permissions'],
        subcommands: [
          new Command({
            name: 'add',
            aliases: ['give'],
            args: [
              new Arg({ name: 'command', type: 'command' }),
              new Arg({ name: 'tag' })
            ],
            run: async (msg, args, bot) => {
              /** @type {Command} */
              let command = args.command
              let tags = await command.getPermissions(true)
              if (!tags.includes(args.tag)) {
                tags.push(args.tag)
                command.setPermissions(tags).then(() => {
                  bot.client.createMessage(msg.channel.id, `:white_check_mark: Successfully gave command \`${command.getFullName()}\` tag '${args.tag}'`)
                })
              } else {
                bot.client.createMessage(msg.channel.id, `:x: Command \`${command.getFullName()}\` already has tag '${args.tag}'`)
              }
            }
          }),
          new Command({
            name: 'remove',
            aliases: ['take'],
            args: [
              new Arg({ name: 'command', type: 'command' }),
              new Arg({ name: 'tag' })
            ],
            run: async (msg, args, bot) => {
              /** @type {Command} */
              let command = args.command
              let tags = await command.getPermissions(true)
              if (tags.includes(args.tag)) {
                tags = tags.filter((tag) => { return tag !== args.tag })
                command.setPermissions(tags).then(() => {
                  bot.client.createMessage(msg.channel.id, `:white_check_mark: Successfully removed tag '${args.tag}' from command \`${command.getFullName()}\``)
                })
              } else {
                bot.client.createMessage(msg.channel.id, `:x: Command \`${command.getFullName()}\` doesn't have tag '${args.tag}'`)
              }
            }
          }),
          new Command({
            name: 'get',
            aliases: ['list'],
            permMode: Command.PermMode.OVERRIDE,
            args: [
              new Arg({ name: 'command', type: 'command' })
            ],
            defaultPermission: true,
            run: async (msg, args, bot) => {
              /** @type {Command} */
              let command = args.command
              let baseTags = await command.getPermissions(true, true)
              let tags = await command.getPermissions(true)
              let send = ''
              if (baseTags.length === 0) {
                send += `\`${command.getFullName()}\` does not have any tags\n`
              } else {
                send += `\`${command.getFullName()}\` has the following tags: [${baseTags.join(', ')}]\n`
              }
              if (tags.length === 0) {
                send += `With perm mode \`${await command.getPermMode(true)}\`, it does not have any tags`
              } else {
                send += `With perm mode \`${await command.getPermMode(true)}\`, it has the following tags: [${tags.join(', ')}]`
              }
              bot.client.createMessage(msg.channel.id, send)
            }
          })
        ]
      }),
      new Command({
        name: 'reset',
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
