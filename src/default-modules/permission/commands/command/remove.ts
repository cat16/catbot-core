import { Arg, ArgType, Command, CommandConstructionData, CommandContext } from "../../../..";

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: "remove",
            aliases: ["take"],
            args: [
                new Arg({ name: "command", types: [ArgType.COMMAND] }),
                new Arg({ name: "tag" }),
            ],
        });
    }
    public async run(data: CommandContext) {
        const command: Command = data.args.get("command");
        const tag: string = data.args.get("tag");
        let tags = await command.getPermissions(true);
        if (tags.includes(tag)) {
            tags = tags.filter((tag) => tag !== tag);
            command.setPermissions(tags).then(() => {
                data.say(`:white_check_mark: Successfully removed tag '${tag}' from command \`${command.getFullName()}\``);
            });
        } else {
            data.say(`:x: Command \`${command.getFullName()}\` doesn't have tag '${tag}'`);
        }
    }
}
