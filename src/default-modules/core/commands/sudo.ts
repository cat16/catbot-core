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
  async hasPermission(context) {
    return (
      context.user.id ===
      (await this.bot.getClient().getOAuthApplication()).owner.id
    );
  }
};

export default createInfo;
