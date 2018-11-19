import Module from "..";
import Bot from "../../bot";
import ElementDirectoryManager from "../../util/file-element/manager/dir";
import ModuleLoader from "./loader";

export class ModuleDirectoryManager extends ElementDirectoryManager<
  Module,
  ModuleLoader
> {
  constructor(directory: string, bot: Bot) {
    super(new ModuleLoader(directory, bot));
  }
}
