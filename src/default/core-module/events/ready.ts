import { EventCreateInfo } from "../../..";

const createInfo: EventCreateInfo = {
  async run() {
    this.bot.commandManager.prefixes.set(
      this.bot.commandManager.prefixes
        .getValue()
        .concat(this.bot.client.user.toString())
    );
  }
};

export default createInfo;
