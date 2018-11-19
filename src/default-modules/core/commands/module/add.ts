import { Arg, ArgType, CommandCreateInfo } from "../../../..";

const args = [
  new Arg({
    name: "test",
    types: [ArgType.BOOLEAN(), ArgType.COMMAND]
  })
];

const createInfo: CommandCreateInfo = {
  args,
  run(context) {
    const test = context.args.get(args[0]);
  }
};

export default createInfo;
