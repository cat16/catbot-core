import Bot from "../bot";
import CommandDirectoryManager from "../command/dir-manager";
import EventDirectoryManager from "../event/dir-manager";
import FileElement from "../util/file-element";
import NamedElement from "../util/file-element/named-element";
import ModuleCreateInfo from "./dir-manager/create-info";

export default class Module extends FileElement implements NamedElement {
  private bot: Bot;
  private name: string;
  private aliases: string[];
  private commandLoader: CommandDirectoryManager;
  private eventDirManager: EventDirectoryManager;

  constructor(
    fileName: string,
    bot: Bot,
    directory: string,
    createInfo: ModuleCreateInfo
  ) {
    super(fileName);
    this.commandLoader = new CommandDirectoryManager(
      `${directory}/commands`,
      bot
    );
    this.eventDirManager = new EventDirectoryManager(
      `${directory}/events`,
      bot
    );
    this.name = fileName;
    this.aliases = createInfo.aliases;
    this.bot = bot;
  }

  public load(): void {
    this.commandLoader.load();
    this.eventDirManager.load();
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

  public getCommandManager(): CommandDirectoryManager {
    return this.commandLoader;
  }

  public getEventManager(): EventDirectoryManager {
    return this.eventDirManager;
  }
}
