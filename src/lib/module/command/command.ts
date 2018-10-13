import { Message, MessageContent } from "eris";

import Bot from "../../bot";
import {
  ElementGenerationFunction,
  ElementGroup,
  RecursiveElement,
  RecursiveElementLoader
} from "../../handler";
import Logger from "../../util/logger";
import Module from "../module";
import Arg from "./arg/arg";
import { CommandLoader } from "./command-manager";

export class ArgList {
  public content: string;
  private args: Map<string, any>;

  constructor(args: Map<string, any>, content: string) {
    this.args = args;
    this.content = content;
  }

  public get(arg: string): any {
    return this.args.get(arg);
  }
}

export class CommandContext {
  public bot: Bot;
  public msg: Message;
  public args: ArgList;

  constructor(bot, msg, args: ArgList) {
    this.bot = bot;
    this.msg = msg;
    this.args = args;
  }

  public say(msg: MessageContent): Promise<Message> {
    return this.msg.channel.createMessage(msg);
  }
}

export abstract class ModuleData {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
}

export interface CommandOptions {
  name: string;
  aliases?: string[];
  args?: Arg[];
  silent?: boolean;
}

export interface CommandConstructionData {
  bot: Bot;
  manager: CommandLoader;
  parent?: Command;
}

export type CommandOrGroup = Command | CommandGroup;

export class CommandGroup extends ElementGroup<Command, CommandLoader> {
  private name: string;

  constructor(
    directory: string,
    generateElement: ElementGenerationFunction<Command>
  ) {
    super(directory, generateElement);
    this.name = directory;
  }

  public getName(): string {
    return this.name;
  }
}

// TODO: Make more things private
export default abstract class Command implements RecursiveElement {
  public name: string;
  public args: Arg[];
  public silent: boolean;

  public logger: Logger;

  private aliases: string[];
  private manager: CommandLoader;
  private module: Module;
  private parent?: Command;

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
