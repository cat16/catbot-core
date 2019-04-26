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
      } catch (err) {
        context.error(`You probably typed the url wrong xd: ${err.stack}`);
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
      this.logger.debug(
        `Took ${delAttempts} tries to delete downloaded folder`
      );
      const result = await this.bot.moduleManager.loadModule(moduleName);
      if (result.error) {
        context.error(`Error loading module: ${result.error.stack}`);
      } else if (!result.found) {
        context.error("cat16's code is weak");
      } else {
        const cmdErrors = result.element.commandDirManager.loadAll();
        const evtErrors = result.element.eventDirManager.loadAll();
        const errors = (result.subErrors ? result.subErrors.size : 0) + cmdErrors.size + evtErrors.size;
        context.success("Module successfully added");
        if(errors > 0) {
          context.error(`${errors} errors occured within the module`)
        }
      }
    } else {
      context.invalid("Module already downloaded");
    }
  }
};

export default createInfo;
