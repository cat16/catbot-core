import { CommandCreateInfo } from "../../..";

const createInfo: CommandCreateInfo = {
  run(context) {
    const msg = context.msg;
    msg.content = msg.content.split(`${this.fileName} `, 2).join("");
    this.bot.commandManager.handleMessage(msg, true);
  },
  async hasPermission(context) {
    return context.user.id === (await this.bot.getOwner()).id;
  }
};

export default createInfo;
