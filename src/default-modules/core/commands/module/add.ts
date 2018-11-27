import { Arg, ArgType, CommandCreateInfo } from "../../../..";

const args = [new Arg("eee", ArgType.COMMAND()).or(ArgType.BOOLEAN())];

const createInfo: CommandCreateInfo = {
  args,
  run(context) {
    const test = context.args.get(args[0]);
  }
};

export default createInfo;
