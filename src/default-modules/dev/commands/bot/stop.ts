import { Arg, ArgType, Command, CommandConstructionData, CommandContext } from "../../../..";

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: "stop",
        });
    }
    public async run(data: CommandContext) {
        await data.say("Stopping...");
        data.bot.stop();
    }
}
