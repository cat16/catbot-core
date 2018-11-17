import { CommandCreateInfo } from "../../..";

const createInfo: CommandCreateInfo = {
  run(context) {
    const commandManager = this.bot.commandManager;
    commandManager.runResult(
      commandManager.parseContent(context.args.content),
      context.msg,
      true
    );
  },
  silent: true,
  async hasPermission(context): Promise<boolean> {
    return (
      context.msg.author.id ===
      (await context.bot.getClient().getOAuthApplication()).owner.id
    );
  }
};
