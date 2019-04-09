import { Arg, ArgValidators, CommandCreateInfo, tuple } from "../../../..";
import { removeDirectory, existsDirectory } from "../../../../lib/util";
const { WORD } = ArgValidators;

const args = tuple([new Arg("module", new WORD())]);

const createInfo: CommandCreateInfo = {
  args,
  aliases: ["delete"],
  async run(context) {
    const moduleName = context.getArg(args[0]);
    const modulesDir = `${this.bot.directory}/modules`;
    if (existsDirectory(`${modulesDir}/${moduleName}`)) {
      removeDirectory(`${modulesDir}/${moduleName}`);
      context.say(
        `:white_check_mark: Successfully deleted module '${moduleName}'`
      );
    } else {
      context.say(`:x: There is no module named ${moduleName}`);
    }
  }
};

export default createInfo;
