import { Command, CommandConstructionData, CommandContext } from "../../../../..";

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: "all",
        });
    }
    public async run(data: CommandContext) {
        const sentp = data.say("Reloading all commands...");
        data.bot.getCommandManager().reload();
        sentp.then((sent) => sent.edit(":white_check_mark: Commands reloaded"));
    }
}
