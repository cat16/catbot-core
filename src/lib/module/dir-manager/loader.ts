import Module from "..";
import Bot from "../../bot";
import FlatElementDirectoryLoader from "../../util/file-element/loader/dir/flat";
import ModuleFactory from "./factory";

export default class ModuleLoader extends FlatElementDirectoryLoader<Module> {
  constructor(directory: string, bot: Bot) {
    super(directory, new ModuleFactory(bot, directory), {
      targetFile: "module",
      createWithoutTargetFile: true
    });
  }
}
