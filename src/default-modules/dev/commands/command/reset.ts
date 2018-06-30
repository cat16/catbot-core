import { Command, Arg, ArgType, CommandConstructionData, CommandContext } from '../../../..'

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: 'reset',
            args: [new Arg({ name: 'command', types: [ArgType.COMMAND] })]
        })
    }
    async run(data: CommandContext) {
        let command: Command = data.args.get('command')
        let sentp = data.say(`Resetting command \`${command.getName()}\`...`)
        await command.load(data.bot.logger, true)
        sentp.then(sent => sent.edit(`:white_check_mark: Successfully reset command \`${command.getName()}\``))
    }
}