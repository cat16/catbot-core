import Bot from "../../bot";
import NamedElement from "../../file-element/named-element";
import RecursiveFileElement from "../../file-element/recursive-file-element";
import Logger from "../../util/logger";
import Module from "../module";
import CommandContext from "./context";

export interface CommandConstructionData {
  fileName: string;
  parent?: CommandInstance;
  bot: Bot;
}

// TODO: Make more things private
export default abstract class CommandInstance
  extends RecursiveFileElement<CommandInstance>
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

  public getName(): string {
    return this.getFileName();
  }

  public getTriggers(): string[] {
    return [this.getName(), ...this.getAliases()];
  }

  public getFullName(): string {
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
