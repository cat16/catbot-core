import { CommandCreateInfo } from "../../../../src";

const createInfo: CommandCreateInfo = {
  run(context) {
    context.msg.channel.send("the test command was run");
  }
};

export default createInfo;
