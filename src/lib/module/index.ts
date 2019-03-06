import Bot from "../bot";
import CommandDirectoryManager from "../command/dir-manager";
import SavedVariable from "../database/saved-variable";
import EventDirectoryManager from "../event/dir-manager";
import FileElement from "../util/file-element";
import NamedElement from "../util/file-element/named-element";
import ModuleCreateInfo from "./create-info";

export default class Module extends FileElement implements NamedElement {
  public readonly bot: Bot;
  public readonly name: string;

  public readonly commandDirManager: CommandDirectoryManager;
  public readonly eventDirManager: EventDirectoryManager;

  public readonly aliases: SavedVariable<string[]>;

  constructor(
    fileName: string,
    bot: Bot,
    directory: string,
    createInfo: ModuleCreateInfo = {}
  ) {
    super(fileName);
    this.commandDirManager = new CommandDirectoryManager(
      `${directory}/commands`,
      bot,
      this
    );
    this.eventDirManager = new EventDirectoryManager(
      `${directory}/events`,
      bot
    );
    this.bot = bot;
    this.name = fileName;
    this.aliases = this.createVariable("aliases", []);
  }

  public load(): void {
    this.commandDirManager.loadAll();
    this.eventDirManager.loadAll();
  }

  public getName(): string {
    return this.name;
  }

  public getAliases(): string[] {
    return this.aliases.getValue();
  }

  private createVariable<T>(
    name: string | string[],
    initValue?: T
  ): SavedVariable<T> {
    return this.bot.createSavedVariable(`module[${this.name}].${name}`, initValue);
  }
}
