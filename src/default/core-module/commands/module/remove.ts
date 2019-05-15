import { Arg, ArgValidators, CommandCreateInfo, tuple } from "../../../..";
import { existsDirectory, removeDirectory } from "../../../../lib/util";
const { WORD } = ArgValidators;

const args = tuple([new Arg("module", new WORD())]);

const createInfo: CommandCreateInfo = {
  aliases: ["delete"],
  args,
  async run(context) {
    const moduleName = context.getArg(args[0]);
    const modulesDir = `${this.bot.directory}/modules`;
    if (existsDirectory(`${modulesDir}/${moduleName}`)) {
      removeDirectory(`${modulesDir}/${moduleName}`);
      this.bot.moduleManager.unloadModule(moduleName);
      context.success(
        `Module '${moduleName}' was deleted`
      );
    } else {
      context.invalid(`There is no module named ${moduleName}`);
    }
  }
};

export default createInfo;
