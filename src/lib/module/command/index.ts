import Bot from "../../bot";
import NamedElement from "../../file-element/named-element";
import RecursiveFileElement from "../../file-element/recursive-file-element";
import Logger from "../../util/logger";
import Module from "../module";
import CommandContext from "./context";
import CommandGroup from "./group";
import RunnableCommand from "./runnable";

export type CommandOrGroup = RunnableCommand | CommandGroup;

export interface CommandOptions {
  name: string;
  aliases?: string[];
  silent?: boolean;
}

export interface CommandConstructionData {
  fileName: string;
  parent?: Command;
  bot: Bot;
}

// TODO: Make more things private
export default abstract class Command
  extends RecursiveFileElement<CommandOrGroup>
  implements NamedElement {
  private aliases: string[];
  private module: Module;

  private silent: boolean;
  private logger: Logger;

  constructor(data: CommandConstructionData, options: CommandOptions) {
    super(data.fileName, data.parent);

    this.aliases = options.aliases || [];
    this.silent = options.silent || false;
    this.module = null;

    this.logger = new Logger(
      `command::${this.getFilePath(" ")}`,
      data.bot.getLogger()
    );
  }

  public getName() {
    return this.getFileName();
  }

  public getTriggers() {
    return [this.getName(), ...this.getAliases()];
  }

  public getFullName() {
    return this.getFilePath(" ");
  }

  public hasPermission(context: CommandContext): Promise<boolean> | boolean {
    return false;
  }

  public getAliases(): string[] {
    return this.aliases;
  }

  public getModule(): Module {
    return this.module;
  }

  public isSilent(): boolean {
    return this.silent;
  }
}
