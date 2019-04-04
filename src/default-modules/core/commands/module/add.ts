// tslint:disable-next-line: no-submodule-imports
import * as simpleGit from "simple-git/promise";
import { Arg, ArgValidators, CommandCreateInfo, tuple } from "../../../..";
import {
  copyDirectory,
  createDirectory,
  existsDirectory,
  removeDirectory
} from "../../../../lib/util";
const { WORD } = ArgValidators;

const args = tuple([
  new Arg("git-repo-url", new WORD()),
  new Arg("module", new WORD())
]);

const createInfo: CommandCreateInfo = {
  args,
  async run(context) {
    const repoUrl = context.getArg(args[0]);
    const moduleName = context.getArg(args[1]);
    const moduleLoc = `${this.bot.directory}/modules`;
    const moduleDir = `${moduleLoc}/${moduleName}`;
    const tempLoc = `${this.bot.directory}/temp`;
    const tempDirBaseName = `git-clone`;
    let tempDirName = tempDirBaseName;
    let i = 1;
    while (existsDirectory(`${tempLoc}/${tempDirName}`)) {
      tempDirName = `${tempDirBaseName}-${++i}`;
    }
    const tempDir = `${tempLoc}/${tempDirName}`;

    createDirectory(moduleLoc);

    if (!existsDirectory(moduleDir)) {
      createDirectory(tempLoc);
      const git = simpleGit(tempLoc);
      try {
        await git.clone(repoUrl, tempDirName, []);
      } catch(err) {
        context.say(`You probably typed the url wrong xd: ${err.stack}`)
      }
      createDirectory(moduleDir);
      copyDirectory(`${tempDir}/modules/${moduleName}`, moduleDir);
      let delAttempts = 1;
      while (true) {
        try {
          removeDirectory(tempDir);
          break;
        } catch (ex) {
          delAttempts++;
        }
      }
      this.logger.debug(`Took ${delAttempts} tries to delete downloaded folder`)
      const result = this.bot.moduleManager.loadModule(moduleName);
      if(result.error) {
        context.say(`Error loading module: ${result.error.stack}`);
      } else if(!result.found) {
        context.say("cat16's code is weak")
      } else {
        this.bot.moduleManager.loadModule(moduleName);
        context.say(":white_check_mark: Module successfully added")
      }
    } else {
      context.say(":x: Module already downloaded");
    }
  }
};

export default createInfo;
