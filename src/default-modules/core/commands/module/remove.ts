import { Arg, ArgValidators, CommandCreateInfo, tuple } from "../../../..";
import { removeDirectory } from "../../../../lib/util";
const { WORD } = ArgValidators;

const args = tuple([
  new Arg("module", new WORD())
]);

const createInfo: CommandCreateInfo = {
  args,
  aliases: ["delete"],
  async run(context) {
    const moduleName = context.getArg(args[0]);
    const modulesDir = `${this.bot.directory}/modules`;
    removeDirectory(`${modulesDir}/${moduleName}`);
    context.say(`:white_check_mark: Successfully deleted module '${moduleName}'`)
  }
};

export default createInfo;
