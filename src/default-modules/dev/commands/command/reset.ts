import { Arg, ArgType, Command, CommandConstructionData, CommandContext } from "../../../..";

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: "reset",
            args: [new Arg({ name: "command", types: [ArgType.COMMAND] })],
        });
    }
    public async run(context: CommandContext) {
        context.say("This command is disabled as of now, sorry for the inconvenience.");
        /*let command: Command = data.args.get('command')
        let sentp = data.say(`Resetting command \`${command.getName()}\`...`)
        await command.load(data.bot.getLogger(), true)
        sentp.then(sent => sent.edit(`:white_check_mark: Successfully reset command \`${command.getName()}\``))*/
    }
}
