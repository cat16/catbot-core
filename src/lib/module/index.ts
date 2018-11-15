import Bot from "../bot";
import FileElement from "../file-element";
import NamedElement from "../file-element/named-element";
import CommandManager from "./command/manager";
import EventManager from "./event/manager";
import ModuleCreateInfo from "./manager/create-info";

export default class Module extends FileElement implements NamedElement {
  private bot: Bot;
  private name: string;
  private aliases: string[];
  private commandLoader: CommandManager;
  private eventDirManager: EventManager;

  constructor(
    fileName: string,
    bot: Bot,
    directory: string,
    createInfo: ModuleCreateInfo
  ) {
    super(fileName);
    this.commandLoader = new CommandManager(`${directory}/commands`, bot);
    this.eventDirManager = new EventManager(`${directory}/events`, bot);
    this.name = fileName;
    this.aliases = createInfo.aliases;
    this.bot = bot;
  }

  public getAliases(): string[] {
    return this.aliases;
  }

  public getName(): string {
    return this.name;
  }

  public getBot(): Bot {
    return this.bot;
  }

  public getCommandManager(): CommandManager {
    return this.commandLoader;
  }

  public getEventManager(): EventManager {
    return this.eventDirManager;
  }
}
