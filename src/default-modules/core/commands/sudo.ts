import { CommandCreateInfo } from "../../..";

const createInfo: CommandCreateInfo = {
  run(context) {
    const msg = context.msg;
    msg.content = msg.content.split(`${this.getFileName()} `, 2).join("");
    this.bot.commandManager.handleMessage(msg, true);
  },
  async hasPermission(context) {
    return (
      context.user.id ===
      (await this.bot.getClient().getOAuthApplication()).owner.id
    );
  }
};

export default createInfo;
