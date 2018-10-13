import { Command, CommandConstructionData, CommandContext } from "../../../../..";

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: "full",
        });
    }
    public async run(data: CommandContext) {
        const sentp = data.say("Restarting...");
        await data.bot.restart(true);
        sentp.then((sent) => sent.edit(":white_check_mark: Successfully restarted (full)"));
    }
}
