import { CommandContext, Command, CommandConstructionData } from "../../../../../..";

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: 'full'
        })
    }
    async run(data: CommandContext) {
        let sentp = data.say('Restarting...')
        await data.bot.restart(true)
        sentp.then(sent => sent.edit(':white_check_mark: Successfully restarted (full)'))
    }
}