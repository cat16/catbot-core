import { Command, Arg, ArgType, CommandContext, CommandConstructionData } from '../../../../..'
import PermissionManager from '../../permission-manager'

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: 'add',
            aliases: ['give'],
            args: [
                new Arg({ name: 'command', types: [ArgType.COMMAND] }),
                new Arg({ name: 'tag' })
            ]
        })
    }

    async run (data: CommandContext) {
        let command: Command = data.args.get('command')
        let tag: string = data.args.get('tag')
        let permissionManager: PermissionManager = data.bot.getModule('permissions').data.permissionManager
        let tags = await command.getPermissions(true)
        if (!tags.includes(tag)) {
            tags.push(tag)
            command.setPermissions(tags).then(() => {
                data.say(`:white_check_mark: Successfully gave command \`${command.getName()}\` tag '${tag}'`)
            })
        } else {
            data.say(`:x: Command \`${command.getName()}\` already has tag '${tag}'`)
        }
    }
}