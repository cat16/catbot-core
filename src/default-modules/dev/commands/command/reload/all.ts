import { CommandContext, Command, CommandConstructionData } from "../../../../..";

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: 'all'
        })
    }
    async run(data: CommandContext) {
        let sentp = data.say('Reloading all commands...')
        data.bot.getMainModule().commandManager.reload()
        sentp.then(sent => sent.edit(':white_check_mark: Commands reloaded'))
    }
}