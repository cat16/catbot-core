import { CommandCreateInfo } from "../../../../src";

const createInfo: CommandCreateInfo = {
  run(context) {
    context.say("the test command was run");
  }
};

export default createInfo;
