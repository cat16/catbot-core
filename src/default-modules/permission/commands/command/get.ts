import { Arg, ArgType, Command, CommandConstructionData, CommandContext } from "../../../..";

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: "get",
            aliases: ["list"],
            args: [
                new Arg({ name: "command", types: [ArgType.COMMAND] }),
            ],
            defaultPermission: true,
            moduleData: [
                new PermissionData({
                    permMode: PermMode.OVERRIDE,
                }),
            ],
        });
    }
    public async run(data: CommandContext) {
        const command: Command = data.args.get("command");
        const baseTags = await command.getPermissions(true, true);
        const tags = await command.getPermissions(true);
        let send = "";
        if (baseTags.length === 0) {
            send += `\`${command.getFullName()}\` does not have any tags\n`;
        } else {
            send += `\`${command.getFullName()}\` has the following tags: [${baseTags.join(", ")}]\n`;
        }
        if (tags.length === 0) {
            send += `With perm mode \`${await command.getPermMode(true)}\`, it does not have any tags`;
        } else {
            send += `With perm mode \`${await command.getPermMode(true)}\`, it has the following tags: [${tags.join(", ")}]`;
        }
        data.bot.client.createMessage(data.msg.channel.id, send);
    }
}