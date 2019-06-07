import Command from "..";
import Bot from "../../bot";
import Module from "../../module";
import ElementDirectoryManager from "../../util/file-element/manager/dir";
import CommandLoader from "./loader";

export default class CommandDirectoryManager extends ElementDirectoryManager<
  Command,
  CommandLoader
> {
  constructor(directory: string, bot: Bot, module2: Module) {
    super(new CommandLoader(directory, bot, module2));
  }
}
