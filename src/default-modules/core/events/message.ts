import { Message } from "discord.js";
import { EventCreateInfo } from "../../..";

const createInfo: EventCreateInfo = {
  async run(context) {
    const msg: Message = context.get(0);
    if (msg.author.id === this.bot.getClient().user.id) {
      return;
    }
    // TODO: I just found this code commented out, I should probably do something about it later :)
    if (msg.author.bot /*&& !bot.get('disableBotInput', false)*/) {
      return;
    }
    this.bot.commandManager.handleMessage(msg);
  }
};

export default createInfo;
