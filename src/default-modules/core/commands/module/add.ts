import { Arg, ArgValidator, CommandCreateInfo } from "../../../..";

const eee = new Arg("eee")
  .with(new ArgValidator.COMMAND())
  .or(new ArgValidator.BOOLEAN());

const createInfo: CommandCreateInfo = {
  args: [eee],
  run(context) {
    const test = eee.from(context);
    context.say(typeof test === "boolean" ? `${test}` : test.name);
  }
};

export default createInfo;
