import { Guild, GuildChannel, Message } from "discord.js";
import ArgList from "../../arg/list";
import CommandRunContext from "../run-context";

export default class GuildCommandRunContext extends CommandRunContext {

    public readonly guild: Guild;
    public readonly guildChannel: GuildChannel;

    constructor(msg: Message, args: ArgList, channel: GuildChannel, guild: Guild) {
        super(msg, args);
        this.guildChannel = channel;
        this.guild = guild;
    }
}
