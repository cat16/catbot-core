import { Command, Event } from "../..";
import Bot from "../bot";
import CommandDirectoryManager from "../command/dir-manager";
import SavedVariable from "../database/saved-variable";
import EventDirectoryManager from "../event/dir-manager";
import FileElement from "../util/file-element";
import NamedElement from "../util/file-element/named-element";
import ModuleCreateInfo from "./create-info";

export default class Module extends FileElement implements NamedElement {
  private _name: string;

  private _commandDirManager: CommandDirectoryManager;
  private _eventDirManager: EventDirectoryManager;

  private _aliases: SavedVariable<string[]>;
  private _description?: string;

  constructor(
    fileName: string,
    private bot: Bot,
    directory: string,
    createInfo: ModuleCreateInfo = {}
  ) {
    super(fileName);
    this._commandDirManager = new CommandDirectoryManager(
      `${directory}/commands`,
      bot,
      this
    );
    this._eventDirManager = new EventDirectoryManager(
      `${directory}/events`,
      bot
    );
    this._name = fileName;
    this._aliases = this.createVariable("aliases", createInfo.aliases || []);
    this._description = createInfo.description;
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
    this._aliases.unload();
  }

  public getCommands(): Command[] {
    return this.commandDirManager.getElements();
  }

  public getEvents(): Event[] {
    return this.eventDirManager.getElements();
  }

  get name(): string {
    return this._name;
  }

  get aliases(): string[] {
    return this._aliases.getValue();
  }

  get description(): string {
    return this._description;
  }

  get commandDirManager(): CommandDirectoryManager {
    return this._commandDirManager;
  }

  get eventDirManager(): EventDirectoryManager {
    return this._eventDirManager;
  }

  public createVariable<T>(
    name: string | string[],
    initValue?: T | Promise<T>
  ): SavedVariable<T> {
    return this.bot.createSavedVariable(
      `module[${this.name}].${name}`,
      initValue
    );
  }
}
