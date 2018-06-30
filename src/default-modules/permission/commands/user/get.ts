import { Command, Arg, ArgType, Bot, CommandContext, CommandConstructionData } from '../../../..'
import { User } from 'eris'
import { PermMode } from '../../module'

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: 'get',
            aliases: ['list'],
            permMode: PermMode.OVERRIDE,
            args: [
                new Arg({ name: 'user', types: [ArgType.USER] })
            ],
            defaultPermission: true
        })
    }
    async run(data: CommandContext) {
        let user: User = data.args.get('user')
        let tags = await data.bot.userManager.getUserPermTags(user.id, true)
        if (tags.length < 1) {
            data.say(`${user.username} does not have any tags`)
        } else {
            data.say(`${user.username} has the following tags: [${tags.join(', ')}]`)
        }
    }
}