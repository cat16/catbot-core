import Bot from "../bot";
import CommandDirectoryManager from "../command/dir-manager";
import DatabaseVariable from "../database/database-variable";
import EventDirectoryManager from "../event/dir-manager";
import { array } from "../util";
import FileElement from "../util/file-element";
import NamedElement from "../util/file-element/named-element";
import ModuleCreateInfo from "./create-info";

export default class Module extends FileElement implements NamedElement {
  public readonly bot: Bot;
  public readonly name: string;

  public readonly commandDirManager: CommandDirectoryManager;
  public readonly eventDirManager: EventDirectoryManager;

  public readonly aliases: DatabaseVariable<string[]>;

  constructor(
    fileName: string,
    bot: Bot,
    directory: string,
    createInfo: ModuleCreateInfo
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
    this.name = fileName;
    this.aliases = this.createVariable(createInfo.aliases, []);
    this.bot = bot;
  }

  public load(): void {
    this.commandDirManager.load();
    this.eventDirManager.load();
  }

  public getName(): string {
    return this.name;
  }

  public getAliases(): string[] {
    return this.aliases.getValue();
  }

  private createVariable<T>(
    name: string | string[],
    defaultValue?: T
  ): DatabaseVariable<T> {
    return new DatabaseVariable(
      this.bot.getDatabase(),
      array(name),
      defaultValue
    );
  }
}
