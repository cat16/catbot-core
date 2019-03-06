import Command from "..";
import Bot from "../../bot";
import Module from "../../module";
import RecursiveElementDirectoryLoader from "../../util/file-element/loader/default/recursive";
import CommandFactory from "./factory";

export default class CommandLoader extends RecursiveElementDirectoryLoader<
  Command
> {
  constructor(directory: string, bot: Bot, module2: Module) {
    super(directory, new CommandFactory(bot, module2));
  }
}
