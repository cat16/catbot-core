import { Command, PermMode, Arg, ArgType } from '../../../index'

export default (bot) => {
  return new Command({
    name: 'user',
    subcommands: [
      new Command({
        name: 'tag',
        subcommands: [
          new Command({
            name: 'add',
            aliases: ['give'],
            args: [
              new Arg({ name: 'user', types: [ArgType.USER] }),
              new Arg({ name: 'tag' })
            ],
            run: async (msg, args, bot) => {
              let tags = await bot.userManager.getUserPermTags(args.user.id, true)
              if (!tags.some(tag => tag === args.tag)) {
                tags.push(args.tag)
                bot.userManager.setUserPermTags(args.user.id, tags).then(() => {
                  bot.client.createMessage(msg.channel.id, `:white_check_mark: Successfully gave ${args.user.username} tag '${args.tag}'`)
                })
              } else {
                bot.client.createMessage(msg.channel.id, `:x: ${args.user.username} already has tag '${args.tag}'`)
              }
            }
          }),
          new Command({
            name: 'remove',
            aliases: ['take'],
            args: [
              new Arg({ name: 'user', types: [ArgType.USER] }),
              new Arg({ name: 'tag' })
            ],
            run: async (msg, args, bot) => {
              let tags = await bot.userManager.getUserPermTags(args.user.id, true)
              if (tags.some(tag => tag === args.tag)) {
                tags = tags.filter((tag) => { return tag !== args.tag })
                bot.userManager.setUserPermTags(args.user.id, tags).then(() => {
                  bot.client.createMessage(msg.channel.id, `:white_check_mark: Successfully removed tag '${args.tag}' from ${args.user.username}`)
                })
              } else {
                bot.client.createMessage(msg.channel.id, `:x: ${args.user.username} doesn't have tag '${args.tag}'`)
              }
            }
          }),
          new Command({
            name: 'get',
            aliases: ['list'],
            permMode: PermMode.OVERRIDE,
            args: [
              new Arg({ name: 'user', types: [ArgType.USER] })
            ],
            defaultPermission: true,
            run: async (msg, args, bot) => {
              let tags = await bot.userManager.getUserPermTags(args.user.id, true)
              if (tags.length < 1) {
                bot.client.createMessage(msg.channel.id, `${args.user.username} does not have any tags`)
              } else {
                bot.client.createMessage(msg.channel.id, `${args.user.username} has the following tags: [${tags.join(', ')}]`)
              }
            }
          })
        ]
      })
    ]
  })
}
