import { Command, CommandConstructionData, CommandContext } from "../../..";

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: "invite",
        });
    }
    public run(context: CommandContext) {
        context.say(`Invite: https://discordapp.com/oauth2/authorize?client_id=${context.bot.getClient().user.id}&permissions=0&scope=bot`);
    }
}
