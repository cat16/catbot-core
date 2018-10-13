import { Arg, ArgType, Command, CommandConstructionData, CommandContext } from "../../../..";
import { PermissionModule } from "../../module";
import PermissionManager from "../../permission-manager";

export default class extends Command {
    constructor(data: CommandConstructionData) {
        super(data, {
            name: "add",
            aliases: ["give"],
            args: [
                new Arg({ name: "command", types: [ArgType.COMMAND] }),
                new Arg({ name: "tag" }),
            ],
        });
    }

    public async run(context: CommandContext) {
        const command: Command = context.args.get("command");
        const tag: string = context.args.get("tag");
        const permissionManager: PermissionManager = (this.getModule() as any as PermissionModule).permissionManager;
        const tags = await command.getPermissions(true);
        if (!tags.includes(tag)) {
            tags.push(tag);
            command.setPermissions(tags).then(() => {
                context.say(`:white_check_mark: Successfully gave command \`${command.getFullName()}\` tag '${tag}'`);
            });
        } else {
            context.say(`:x: Command \`${command.getFullName()}\` already has tag '${tag}'`);
        }
    }
}
