import Command from "../.";
import Bot from "../../bot";
import Module from "../../module";
import RecursiveElementFactory from "../../util/file-element/factory/recursive";
import RunnableCommand from "../runnable";
import RunnableCommandCreateInfo, {
  isRunnableCommandCreateInfo
} from "../runnable/create-info";

export default class CommandFactory
  implements RecursiveElementFactory<Command> {
  private _bot: Bot;
  public get bot(): Bot {
    return this._bot;
  }
  private _module: Module;
  public get module(): Module {
    return this._module;
  }

  constructor(bot: Bot, module2: Module) {
    this._bot = bot;
    this._module = module2;
  }

  public create(
    rawElement: RunnableCommandCreateInfo,
    fileName: string,
    path: string,
    parent?: Command
  ) {
    if (isRunnableCommandCreateInfo(rawElement)) {
      return new RunnableCommand(
        fileName,
        parent,
        this.bot,
        this.module,
        rawElement
      );
    } else {
      return new Command(fileName, parent, this.bot, this.module, rawElement);
    }
  }
  public createDir(dirName: string, parent: Command) {
    return new Command(dirName, parent, this.bot, this.module, {});
  }
}
