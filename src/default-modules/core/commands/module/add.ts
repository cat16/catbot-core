import { Arg, ArgValidators, CommandCreateInfo } from "../../../..";
const { BOOLEAN, COMMAND } = ArgValidators;
const args = [
  new Arg("eee", new BOOLEAN()).or(new COMMAND())
];

const createInfo: CommandCreateInfo = {
  args,
  run(context) {
    const test = context.getArg(args[0]);
  }
};

export default createInfo;
