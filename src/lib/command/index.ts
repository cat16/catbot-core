import Bot from "../bot";
import SavedVariable from "../database/saved-variable";
import Module from "../module";
import NamedElement from "../util/file-element/named-element";
import RecursiveFileElement from "../util/file-element/recursive-file-element";
import Logger from "../util/logger";
import CommandCreateInfo from "./create-info";

export enum CommandChannelType {
  ANY,
  GUILD,
  PRIVATE
}

export default class Command extends RecursiveFileElement<Command>
  implements NamedElement {
  public readonly logger: Logger;
  public readonly bot: Bot;
  public readonly module: Module;
  public readonly name: string;

  public readonly aliases: SavedVariable<string[]>;
  public readonly guildOnly: SavedVariable<CommandChannelType>;

  constructor(
    fileName: string,
    parent: Command,
    bot: Bot,
    module2: Module,
    createInfo: CommandCreateInfo
  ) {
    super(fileName, parent);
    this.bot = bot;
    this.module = module2;
    this.name = fileName;

    this.aliases = this.createVariable("aliases", createInfo.aliases || []);
    this.guildOnly = this.createVariable(
      "guildOnly",
      createInfo.guildOnly || CommandChannelType.ANY
    );

    this.logger = new Logger(`command::${this.getFilePath(" ")}`, bot.logger);
  }

  public getName(): string {
    return this.name;
  }

  public getAliases(): string[] {
    return this.aliases.getValue();
  }

  public getFullName(separator: string = " "): string {
    return this.getFilePath(separator);
  }

  private createVariable<T>(
    key: string,
    initValue?: T
  ): SavedVariable<T> {
    return this.module.createVariable(`command[${this.getFullName(".")}].${key}`, initValue)
  }
}
