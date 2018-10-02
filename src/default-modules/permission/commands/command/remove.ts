import { Command, Arg, ArgType, CommandContext, CommandConstructionData } from '../../../..'

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: 'remove',
            aliases: ['take'],
            args: [
                new Arg({ name: 'command', types: [ArgType.COMMAND] }),
                new Arg({ name: 'tag' })
            ]
        })
    }
    async run(data: CommandContext) {
        let command: Command = data.args.get('command')
        let tag: string = data.args.get('tag')
        let tags = await command.getPermissions(true)
        if (tags.includes(tag)) {
            tags = tags.filter((tag) => { return tag !== tag })
            command.setPermissions(tags).then(() => {
                data.say(`:white_check_mark: Successfully removed tag '${tag}' from command \`${command.getFullName()}\``)
            })
        } else {
            data.say(`:x: Command \`${command.getFullName()}\` doesn't have tag '${tag}'`)
        }
    }
}