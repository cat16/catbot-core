import { Command, Arg, ArgType, CommandContext, CommandConstructionData } from '../../../..'
import PermissionManager from '../../permission-manager'
import { PermissionModule } from '../../module'

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

    async run (context: CommandContext) {
        let command: Command = context.args.get('command')
        let tag: string = context.args.get('tag')
        let permissionManager: PermissionManager = (<PermissionModule><any>this.getModule()).permissionManager
        let tags = await command.getPermissions(true)
        if (!tags.includes(tag)) {
            tags.push(tag)
            command.setPermissions(tags).then(() => {
                context.say(`:white_check_mark: Successfully gave command \`${command.getName()}\` tag '${tag}'`)
            })
        } else {
            context.say(`:x: Command \`${command.getName()}\` already has tag '${tag}'`)
        }
    }
}