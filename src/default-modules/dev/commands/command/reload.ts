import { Command, Arg, ArgType, CommandConstructionData, CommandContext } from '../../../..'

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: 'reload'
        })
    }
    async run(data: CommandContext) {
        return new Promise((resolve, reject) => {
            let sentp = data.say(`Reloading command ${data.args.content}...`)
            if (data.bot.getCommandManager().reloadElement(data.args.content))
                sentp.then(sent => sent.edit(`:white_check_mark: Command \`${data.args.content}\` reloaded`))
            else 
                sentp.then(sent => sent.edit(`:x: Could not reload command ${data.args.content}`))
        })
    }
}