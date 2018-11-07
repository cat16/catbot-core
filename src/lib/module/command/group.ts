import RecursiveFileElement from "../../file-element/recursive-file-element";
import CommandInstance, {
  CommandConstructionData,
  CommandOptions
} from "./instance";

export default class CommandGroup extends CommandInstance {
  constructor(data: CommandConstructionData, options: CommandOptions) {
    super(data, options);
  }
}
