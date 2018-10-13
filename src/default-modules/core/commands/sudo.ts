import { Command, CommandConstructionData, CommandContext } from "../../..";

export default class extends Command {
  constructor(data: CommandConstructionData) {
    super(data, {
      name: "sudo",
      silent: true,
    });
  }
  public async run(context: CommandContext) {
    const bot = context.bot;
    const commandManager = bot.getCommandManager();
    commandManager.runResult(
      commandManager.parseContent(
        context.args.content,
        commandManager.getAllElements(),
        commandManager.find("sudo").data.element,
      ),
      context.msg,
      true,
    );
  }
  public async hasPermission(context: CommandContext): Promise<boolean> {
    return context.msg.author.id === (await context.bot.getClient().getOAuthApplication()).owner.id;
  }
}
