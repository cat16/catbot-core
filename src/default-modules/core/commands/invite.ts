import { Command, CommandContext, CommandConstructionData } from '../../../index'

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: 'invite'
        })
    }
    run(context: CommandContext) {
        context.say(`Invite: https://discordapp.com/oauth2/authorize?client_id=${context.bot.client.user.id}&permissions=0&scope=bot`)
    }
}