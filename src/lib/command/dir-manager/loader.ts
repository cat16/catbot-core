import Command from "..";
import Bot from "../../bot";
import RecursiveElementDirectoryLoader from "../../util/file-element/loader/dir/recursive";
import CommandFactory from "./factory";

export default class CommandLoader extends RecursiveElementDirectoryLoader<
  Command
> {
  constructor(directory: string, bot: Bot) {
    super(directory, new CommandFactory(bot));
  }
}
