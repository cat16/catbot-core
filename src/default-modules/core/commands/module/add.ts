import { Arg, ArgValidators, CommandCreateInfo, tuple } from "../../../..";
const { BOOLEAN, COMMAND, STRING } = ArgValidators;

const args = tuple([
  new Arg("eee", new BOOLEAN()).or(new COMMAND()),
  new Arg("hmm", new STRING(["your", "mom"]))
]);

const createInfo: CommandCreateInfo = {
  args,
  run(context) {
    const test = context.getArg(args[0]);
    context.say(String(test));
  }
};

export default createInfo;
