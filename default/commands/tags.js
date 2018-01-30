const Command = require('../../core.js').Command

module.exports = (bot) => {
  return new Command({
    name: 'tag',
    subcommands: [
      new Command({
        name: 'user',
        subcommands: [
          new Command({
            name: 'add',
            args: [
              new Command.Arg({ name: 'user', type: 'user' }),
              new Command.Arg({ name: 'tag' })
            ],
            run: async (msg, args, bot) => {
              let tags = await bot.getUserPermTags(args.user.id)
              if (!tags.includes(args.tag)) {
                tags.push(args.tag)
                bot.setUserPermTags(args.user.id, tags).then(() => {
                  bot.client.createMessage(msg.channel.id, `:white_check_mark: Successfully gave ${args.user.username} tag '${args.tag}'`)
                })
              } else {
                bot.client.createMessage(msg.channel.id, `:x: ${args.user.username} already has tag '${args.tag}'`)
              }
            }
          }),
          new Command({
            name: 'remove',
            args: [
              new Command.Arg({ name: 'user', type: 'user' }),
              new Command.Arg({ name: 'tag' })
            ],
            run: async (msg, args, bot) => {
              let tags = await bot.getUserPermTags(args.user.id)
              if (tags.includes(args.tag)) {
                tags = tags.filter((tag) => { return tag !== args.tag })
                bot.setUserPermTags(args.user.id, tags).then(() => {
                  bot.client.createMessage(msg.channel.id, `:white_check_mark: Successfully removed tag '${args.tag}' from ${args.user.username}`)
                })
              } else {
                bot.client.createMessage(msg.channel.id, `:x: ${args.user.username} doesn't have tag '${args.tag}'`)
              }
            }
          }),
          new Command({
            name: 'get',
            args: [
              new Command.Arg({ name: 'user', type: 'user' })
            ],
            defaultPermission: true,
            run: async (msg, args, bot) => {
              let tags = await bot.getUserPermTags(args.user.id)
              if (tags.length < 1) {
                bot.client.createMessage(msg.channel.id, `${args.user.username} does not have any tags`)
              } else {
                bot.client.createMessage(msg.channel.id, `${args.user.username} has the following tags: [${tags.join(', ')}]`)
              }
            }
          })
        ]
      }),
      new Command({
        name: 'command',
        subcommands: [
          new Command({
            name: 'add',
            args: [
              new Command.Arg({ name: 'command', type: 'command' }),
              new Command.Arg({ name: 'tag' })
            ],
            run: async (msg, args, bot) => {
              let tags = await bot.commandManager.getCommandPermissions(args.command.name)
              if (!tags.includes(args.tag)) {
                tags.push(args.tag)
                bot.commandManager.setCommandPermissions(args.command.name, tags).then(() => {
                  bot.client.createMessage(msg.channel.id, `:white_check_mark: Successfully gave command ${args.command.name} tag '${args.tag}'`)
                })
              } else {
                bot.client.createMessage(msg.channel.id, `:x: Command ${args.command.name} already has tag '${args.tag}'`)
              }
            }
          }),
          new Command({
            name: 'remove',
            args: [
              new Command.Arg({ name: 'command', type: 'command' }),
              new Command.Arg({ name: 'tag' })
            ],
            run: async (msg, args, bot) => {
              let tags = await bot.commandManager.getCommandPermissions(args.command.name)
              if (tags.includes(args.tag)) {
                tags = tags.filter((tag) => { return tag !== args.tag })
                bot.commandManager.setCommandPermissions(args.command.name, tags).then(() => {
                  bot.client.createMessage(msg.channel.id, `:white_check_mark: Successfully removed tag '${args.tag}' from command ${args.command.name}`)
                })
              } else {
                bot.client.createMessage(msg.channel.id, `:x: Command ${args.command.name} doesn't have tag '${args.tag}'`)
              }
            }
          }),
          new Command({
            name: 'get',
            args: [
              new Command.Arg({ name: 'command', type: 'command' })
            ],
            defaultPermission: true,
            run: async (msg, args, bot) => {
              let tags = await bot.commandManager.getCommandPermissions(args.command.name)
              if (tags.length < 1) {
                bot.client.createMessage(msg.channel.id, `${args.command.name} does not have any tags`)
              } else {
                bot.client.createMessage(msg.channel.id, `${args.command.name} has the following tags: [${tags.join(', ')}]`)
              }
            }
          })
        ]
      })
    ]
  })
}
