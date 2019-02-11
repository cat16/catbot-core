import { Arg, ArgValidators, CommandCreateInfo } from "../../../..";
const { BooleanValidator, CommandValidator } = ArgValidators;
const args = [
  new Arg("eee", new BooleanValidator()).or(new CommandValidator())
];

const createInfo: CommandCreateInfo = {
  args: [eee],
  run(context) {
    const test = context.getArg(args[0]);
  }
};

export default createInfo;
