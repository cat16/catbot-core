import { Channel, TextChannel } from "discord.js";
import Bot from "../bot";
import SavedVariable from "../database/saved-variable";
import Module from "../module";
import { CommandChannelType } from "../util/bot";
import Logger from "../util/console/logger";
import NamedElement from "../util/file-element/named-element";
import RecursiveFileElement from "../util/file-element/recursive-file-element";
import CommandCreateInfo from "./create-info";
import { CommandPermissionContext } from "./permission-context";

export type CommandPermissionFunc = (
  this: Command,
  context: CommandPermissionContext
) => Promise<boolean>;

export default class Command extends RecursiveFileElement<Command>
  implements NamedElement {
  private _logger: Logger;
  private _channelTypes: SavedVariable<CommandChannelType[]>;

  private _name: string;
  private _aliases: SavedVariable<string[]>;

  private hasPermFunc: CommandPermissionFunc;

  public get name(): string {
    return this._name;
  }

  public get aliases(): string[] {
    return this._aliases.getValue();
  }

  public get fullName(): string {
    return this.getFullName();
  }

  public get logger(): Logger {
    return this._logger;
  }

  public get channelTypes(): SavedVariable<CommandChannelType[]> {
    return this._channelTypes;
  }

  constructor(
    fileName: string,
    parent: Command,
    public readonly bot: Bot,
    public readonly module: Module,
    createInfo: CommandCreateInfo
  ) {
    super(fileName, parent);
    this._name = fileName;

    this._aliases = this.createVariable("aliases", createInfo.aliases || []);

    this._channelTypes = this.createInheritableVariable(
      "guildOnly",
      createInfo.channelTypes,
      this.parent ? this.parent.channelTypes : null,
      [TextChannel]
    );

    this.hasPermFunc =
      createInfo.hasPermission ||
      (parent ? parent.hasPermFunc : async () => true);

    this._logger = new Logger(`command::${this.getFilePath(" ")}`, bot.logger);
  }

  public unload(): void {
    this._aliases.unload();
    this.channelTypes.unload();
  }

  public getFullName(separator: string = " "): string {
    return this.getFilePath(separator);
  }

  public canBeRunInChannel(channel: Channel): boolean {
    const types = this.channelTypes.getValue();
    return types.some(T => channel instanceof T);
  }

  public toString() {
    return this.getFilePath(" ");
  }

  public hasPermission(context: CommandPermissionContext): Promise<boolean> {
    return this.hasPermFunc.call(this, context);
  }

  private createVariable<T>(key: string, initValue?: T): SavedVariable<T> {
    return this.module.createVariable(`command[${this}].${key}`, initValue);
  }

  private createInheritableVariable<
    T,
    V extends Command[keyof Command] & SavedVariable<T>
  >(
    key: string,
    createInfoValue: T,
    parentVariable: V,
    defaultValue?: T
  ): SavedVariable<T> {
    let initValue: T | Promise<T>;
    if (createInfoValue === undefined) {
      if (this.parent) {
        initValue = new Promise<T>(resolve => {
          parentVariable.on("load", value => {
            if (value !== undefined) {
              resolve(value);
            } else {
              resolve(defaultValue);
            }
          });
        });
      } else {
        initValue = defaultValue;
      }
    } else {
      initValue = createInfoValue;
    }
    return this.module.createVariable(`command[${this}].${key}`, initValue);
  }
}
