import Command, { CommandConstructionData, CommandOptions } from ".";
import RecursiveFileElement from "../../file-element/recursive-file-element";

export default class CommandGroup extends Command {
  constructor(data: CommandConstructionData, options: CommandOptions) {
    super(data, options);
  }
}
