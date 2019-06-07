// tslint:disable-next-line: no-submodule-imports
import * as simpleGit from "simple-git/promise";
import { Arg, ArgValidators, CommandCreateInfo, tuple } from "../../../..";
import {
  copyDirectory,
  createDirectory,
  createTempDir,
  existsDirectory,
  removeDirectory
} from "../../../../lib/util/file";
const { WORD } = ArgValidators;

const args = tuple([
  new Arg("user", new WORD()),
  new Arg("module", new WORD())
]);

function gitRepoExists(url: string): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    simpleGit()
      .listRemote(["-h", url])
      .then(
        list => {
          resolve(true);
        },
        () => {
          resolve(false);
        }
      );
  });
}

async function getModuleUrl(
  username: string,
  moduleName: string
): Promise<string | null> {
  const base = `https://github.com/${username}/`;
  const names = [`bot-module-${moduleName}`, moduleName];
  for (const name of names) {
    const url = base + name;
    if (await gitRepoExists(url)) {
      return url;
    }
  }
  return null;
}

const createInfo: CommandCreateInfo = {
  args,
  async run(context) {
    const user = args[0].from(context);
    let moduleName = args[1].from(context);
    if (moduleName.startsWith("bot-module-")) {
      moduleName = moduleName.slice(11);
    }
    const url = await getModuleUrl(user, moduleName);
    const moduleLoc = `${this.bot.directory}/modules`;
    const moduleDir = `${moduleLoc}/${moduleName}`;
    const tempLoc = `${this.bot.directory}/temp`;

    // make sure URL is a valid module
    if (!url) {
      context.invalid(
        "The user and or repository could not be found on github"
      );
      return;
    }

    // create module folder (where it will be installed)
    createDirectory(moduleLoc);

    // make sure there's not already a module with the same name
    if (existsDirectory(moduleDir)) {
      context.invalid(
        "There is already a module downloaded with the same name"
      );
      return;
    }

    // setup git and temp directory
    createDirectory(tempLoc);
    const git = simpleGit(tempLoc);
    const tempDir = createTempDir(tempLoc, "module-download");

    // download the module
    try {
      await git.clone(url, tempDir, []);
    } catch (err) {
      context.error(
        `An error occured while downloading the module (git clone): ${
          err.stack
        }`
      );
      removeDirectory(tempDir);
      return;
    }

    // create a directory for the downloaded module and copy it there
    createDirectory(moduleDir);
    copyDirectory(tempDir, moduleDir);

    const result = await this.bot.moduleManager.loadModule(moduleName);
    if (result.error) {
      context.error(`Error loading module: ${result.error.stack}`);
    } else if (!result.found) {
      context.error("You shouldn't see this message!");
      this.bot.report(
        "Add command error",
        "A module downloaded was not found",
        context
      );
    } else {
      const cmdErrors = result.element.loadCommands();
      const evtErrors = result.element.loadEvents();
      this.bot.database.load();
      const errors =
        (result.subErrors ? result.subErrors.size : 0) +
        cmdErrors.size +
        evtErrors.size;
      if (errors === 0) {
        context.success("Module successfully added");
      } else {
        context.partialSuccess(`${errors} errors occured within the module`);
      }
    }

    removeDirectory(tempDir);
  }
};

export default createInfo;
