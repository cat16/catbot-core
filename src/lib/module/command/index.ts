import { Message, MessageContent } from "eris";

import Bot from "../../bot";
import Logger from "../../util/logger";
import Module from "../module";
import Arg from "./arg";

export interface CommandOptions {
  name: string;
  aliases?: string[];
  args?: Arg[];
  silent?: boolean;
}

export interface CommandConstructionData {
  bot: Bot;
  parent?: Command;
}

// TODO: Make more things private
export default abstract class Command implements RecursiveElement {
  public name: string;
  public args: Arg[];
  public silent: boolean;

  public logger: Logger;

  private module: Module;

  private currentMsg: Message;

  constructor(data: CommandConstructionData, options: CommandOptions) {
    this.name = options.name;

    this.aliases = options.aliases || [];
    this.manager = data.manager;
    this.args = options.args || [];
    this.silent = options.silent || false;
    this.parent = data.parent;
    this.module = null;

    this.logger = new Logger(
      `command::${this.getFullName()}`,
      data.bot.getLogger()
    );
  }

  public abstract run(data: CommandContext): void;
  public hasPermission(context: CommandContext): Promise<boolean> | boolean {
    return false;
  }

  public getElementLoader(): CommandLoader {
    return this.manager;
  }

  public getParent(): Command {
    return this.parent;
  }

  public getName(): string {
    return this.name;
  }

  public getFullName(): string {
    return this.parent == null
      ? this.name
      : `${this.parent.getFullName()} ${this.name}`;
  }

  public getSubcommands(): CommandOrGroup[] {
    return this.manager.getAllElements();
  }

  public getAliases(): string[] {
    return this.aliases;
  }

  public getTriggers(): string[] {
    return [this.name].concat(this.aliases);
  }

  public getModule(): Module {
    return this.module;
  }
}
