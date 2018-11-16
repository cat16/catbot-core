import Command from "..";
import Bot from "../../bot";
import ElementDirectoryManager from "../../util/file-element/manager/dir";
import CommandLoader from "./loader";

// move this the hecc out due to me adding pro find functionality and then just make a parser class for this like u said u were gonna
export default class CommandManager extends ElementDirectoryManager<
  Command,
  CommandLoader
> {
  constructor(directory: string, bot: Bot) {
    super(new CommandLoader(directory, bot));
  }
}
