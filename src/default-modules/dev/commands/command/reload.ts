import { Arg, ArgType, Command, CommandConstructionData, CommandContext } from "../../../..";

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: "reload",
        });
    }
    public async run(data: CommandContext) {
        return new Promise((resolve, reject) => {
            const sentp = data.say(`Reloading command ${data.args.content}...`);
            if (data.bot.getCommandManager().reloadElement(data.args.content)) {
                sentp.then((sent) => sent.edit(`:white_check_mark: Command \`${data.args.content}\` reloaded`));
            } else {
                sentp.then((sent) => sent.edit(`:x: Could not reload command ${data.args.content}`));
            }
        });
    }
}
