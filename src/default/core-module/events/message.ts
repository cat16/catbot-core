import { Message } from "discord.js";
import { EventCreateInfo } from "../../..";

const createInfo: EventCreateInfo = {
  async run(context) {
    const msg: Message = context.get(0);
    if (msg.author.bot && !this.bot.commandManager.respondToBotAccounts.getValue()) {
      return;
    }
    this.bot.commandManager.handleMessage(msg);
  }
};

export default createInfo;
