import Bot from "../../bot";
import NamedElement from "../../file-element/named-element";
import RecursiveFileElement from "../../file-element/recursive-file-element";
import Logger from "../../util/logger";
import Module from "../module";
import CommandContext from "./context";
import CommandCreateInfo from "./create-info";

export default class Command extends RecursiveFileElement<Command>
  implements NamedElement {
  private aliases: string[];
  private module: Module;

  private silent: boolean;
  private logger: Logger;

  constructor(
    fileName: string,
    parent: Command,
    bot: Bot,
    createInfo: CommandCreateInfo
  ) {
    super(fileName, parent);

    this.aliases = createInfo.aliases || [];
    this.silent = createInfo.silent || false;
    this.module = null;

    this.logger = new Logger(
      `command::${this.getFilePath(" ")}`,
      bot.getLogger()
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
