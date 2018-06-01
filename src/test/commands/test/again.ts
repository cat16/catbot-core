import { Command, CommandConstructionData, CommandContext } from '../../../index'

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: 'again',
        })
    }
    async run(context) {
        let bot = context.bot
        let msg = context.msg
        let temp = bot.temp.testCommand
        if (temp.userMap[msg.author.id] == null) {
            bot.client.createMessage(msg.channel.id, 'No previous commands were tested')
        } else {
            bot.restart(true).then(() => {
                bot.temp.testCommand = temp
                bot.commandManager.runResult(
                    bot.commandManager.parseContent(temp.userMap[msg.author.id]),
                    msg
                )
            }, (err) => {
                bot.client.createMessage(msg.channel.id, err)
            })
        }
    }
}