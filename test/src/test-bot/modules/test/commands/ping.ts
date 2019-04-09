import { CommandCreateInfo } from "cat16-bot-core";

const createInfo: CommandCreateInfo = {
  run(context) {
    const now = new Date();
    context.say("Ping: loading...").then(sent => {
      const then = new Date();
      sent.edit(`Ping: ${then.getTime() - now.getTime()}ms`);
    });
  },
  async hasPermission(context) {
    return true;
  }
};

export default createInfo;
