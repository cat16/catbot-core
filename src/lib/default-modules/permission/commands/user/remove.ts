import { Command, Arg, ArgType, CommandContext, CommandConstructionData } from '../../../../../index'
import { User } from 'eris'

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: 'remove',
            aliases: ['take'],
            args: [
                new Arg({ name: 'user', types: [ArgType.USER] }),
                new Arg({ name: 'tag' })
            ]
        })
    }
    async run(data: CommandContext) {
        let user: User = data.args.get('user')
        let tag: string = data.args.get('tag')
        let tags = await data.bot.userManager.getUserPermTags(user.id, true)
        if (tags.some(tag => tag === tag)) {
            tags = tags.filter((tag) => { return tag !== tag })
            data.bot.userManager.setUserPermTags(user.id, tags).then(() => {
                data.say(`:white_check_mark: Successfully removed tag '${tag}' from ${user.username}`)
            })
        } else {
            data.say(`:x: ${user.username} doesn't have tag '${tag}'`)
        }
    }
}