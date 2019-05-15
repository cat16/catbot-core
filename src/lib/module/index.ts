import Bot from "../bot";
import CommandDirectoryManager from "../command/dir-manager";
import SavedVariable from "../database/saved-variable";
import EventDirectoryManager from "../event/dir-manager";
import FileElement from "../util/file-element";
import NamedElement from "../util/file-element/named-element";
import ModuleCreateInfo from "./create-info";
import { Command, Event } from "../..";

export default class Module extends FileElement implements NamedElement {
  public readonly bot: Bot;
  public readonly name: string;

  public readonly commandDirManager: CommandDirectoryManager;
  public readonly eventDirManager: EventDirectoryManager;

  public readonly aliases: SavedVariable<string[]>;
  public readonly description?: string;

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
    this.aliases = this.createVariable("aliases", createInfo.aliases || []);
    this.description = createInfo.description;
  }

  public load(): [Map<string, Error>, Map<string, Error>] {
    return [this.commandDirManager.loadAll(), this.eventDirManager.loadAll()];
  }

  public loadCommands(): Map<string, Error> {
    return this.commandDirManager.loadAll();
  }

  public loadEvents(): Map<string, Error> {
    return this.eventDirManager.loadAll();
  }

  public unload(): void {
    this.getCommands().forEach(c => {
      c.unload();
    });
    this.getEvents().forEach(e => () => {
      e.unload();
    });
    this.aliases.unload();
  }

  public getCommands(): Command[] {
    return this.commandDirManager.getElements();
  }

  public getEvents(): Event[] {
    return this.eventDirManager.getElements();
  }

  public getName(): string {
    return this.name;
  }

  public getAliases(): string[] {
    return this.aliases.getValue();
  }

  public createVariable<T>(
    name: string | string[],
    initValue?: T
  ): SavedVariable<T> {
    return this.bot.createSavedVariable(
      `module[${this.name}].${name}`,
      initValue
    );
  }
}
