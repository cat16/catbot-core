import { CommandCreateInfo } from "../../../../../src";
import { restart } from "../restart";

const createInfo: CommandCreateInfo = {
  async run(context) {
    restart(this.bot, context.msg.channel.id, true);
  }
};

export default createInfo;
