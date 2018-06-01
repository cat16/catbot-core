import { Command, Arg, ArgType, CommandConstructionData, CommandContext } from '../../../../../index'

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: 'restart'
        })
    }

    async run(data: CommandContext) {
        let sentp = data.say('Restarting...')
        await data.bot.restart()
        sentp.then(sent => sent.edit(':white_check_mark: Successfully restarted'))
    }
}