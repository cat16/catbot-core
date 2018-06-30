import { Command, Arg, ArgType, CommandConstructionData, CommandContext } from '../../../..'

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: 'stop'
        })
    }
    async run(data: CommandContext) {
        await data.say('Stopping...')
        data.bot.stop()
    }
}