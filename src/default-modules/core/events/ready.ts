import { EventCreateInfo } from "../../..";

const createInfo: EventCreateInfo = {
  async run() {
    this.bot.commandManager.prefixes.set(
      this.bot.commandManager.prefixes
        .getValue()
        .concat(this.bot.getClient().user.toString())
    );
  }
};

export default createInfo;
