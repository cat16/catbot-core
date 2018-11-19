import { Message } from "eris";
import { EventCreateInfo } from "../../..";

const createInfo: EventCreateInfo = {
  async run(context) {
    const msg: Message = context.get(0);
    if (msg.author.id === this.bot.getClient().user.id) {
      return;
    }
    if (msg.author.bot /*&& !bot.get('disableBotInput', false)*/) {
      return;
    }
    this.bot.commandManager.handleMessage(msg);
  }
};

export default createInfo;
