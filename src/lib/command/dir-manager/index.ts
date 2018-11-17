import Command from "..";
import Bot from "../../bot";
import Module from "../../module";
import ElementDirectoryManager from "../../util/file-element/manager/dir";
import CommandLoader from "./loader";

// move this the hecc out due to me adding pro find functionality and then just make a parser class for this like u said u were gonna
export default class CommandDirectoryManager extends ElementDirectoryManager<
  Command,
  CommandLoader
> {
  constructor(directory: string, bot: Bot, module2: Module) {
    super(new CommandLoader(directory, bot, module2));
  }
}
