import Bot from "../bot";
import DatabaseVariable from "../database/database-variable";
import Module from "../module";
import { array } from "../util";
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

  public readonly aliases: DatabaseVariable<string[]>;
  public readonly guildOnly: DatabaseVariable<CommandChannelType>;

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

  public getFullName(): string {
    return this.getFilePath(" ");
  }

  private createVariable<T>(
    key: string | string[],
    defaultValue?: T
  ): DatabaseVariable<T> {
    return new DatabaseVariable<T>(
      this.bot.getDatabase(),
      ["command", this.name, ...array(key)],
      defaultValue
    );
  }
}
