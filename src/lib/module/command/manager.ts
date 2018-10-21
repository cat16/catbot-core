import chalk from "chalk";
import { Message, User } from "eris";

import { Collection } from "mongodb";
import Command, {
  ArgList,
  CommandContext,
  CommandGroup,
  CommandOrGroup
} from ".";
import Bot from "../../bot";
import NamedElementDirectoryManager from "../../element/manager/names-element-directory-manager";
import Logger from "../../util/logger";
import ArgType from "./arg/type";
import CommandError from "./error";
import CommandResult from "./result";
import ITrigger from "./trigger";

const startsWithAny = (str: string, arr: string[]): string => {
  let longest = "";
  arr.forEach(str2 => {
    if (str2.length > longest.length && str.startsWith(str2)) {
      longest = str2;
    }
  });
  return longest.length === 0 ? null : longest;
};

export type PermCheck = (command: CommandOrGroup, user: User) => boolean;

export class CommandManager extends NamedElementDirectoryManager<
  CommandOrGroup
> {
  public permChecks: PermCheck[];
  public bot: Bot;

  public prefixes: string[];
  public lastTriggered: object;

  constructor(bot: Bot) {
    super();
    this.prefixes = [bot.getClient().user.mention];
    this.lastTriggered = {};
    this.bot = bot;
    this.logger = new Logger("command-manager", bot.getLogger());
  }

  public handleMessage(msg: Message): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const result = this.parseFull(msg.content);
      if (result && (await this.shouldRespond(result))) {
        const cooldown: number = await this.getValue("command-cooldown", 0);
        if (cooldown !== 0) {
          const lastTriggered: ITrigger = this.lastTriggered[msg.author.id];
          if (lastTriggered != null) {
            const now = new Date().getTime();
            if (now - lastTriggered.time < cooldown) {
              if (lastTriggered.alreadyTold) {
                return resolve(false);
              } else {
                const seconds = Math.ceil(
                  (cooldown - (now - lastTriggered.time)) / 1000
                );
                this.bot
                  .getClient()
                  .createMessage(
                    msg.channel.id,
                    `:clock1: Please wait before using another command (${seconds} seconds left)`
                  );
                this.lastTriggered[msg.author.id] = {
                  alreadyTold: true,
                  time: lastTriggered.time
                };
                return resolve(true);
              }
            }
          }
        }
        this.runResult(result, msg).then(resolve, reject);
        this.lastTriggered[msg.author.id] = {
          alreadyTold: false,
          time: new Date().getTime()
        };
      }
      resolve(false);
    });
  }

  public shouldRespond(result: CommandResult | CommandError): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const silent = await this.getValue("silent", false);
      const respondToUnknownCommands = await this.getValue(
        "respondToUnknownCommands",
        false
      );
      resolve(
        !(silent && result instanceof CommandError) &&
          (result || respondToUnknownCommands)
      );
    });
  }

  public runResult(
    result: CommandResult | CommandError,
    msg: Message,
    sudo: boolean = false
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (result instanceof CommandError) {
        if (await this.shouldRespond(result)) {
          this.bot.getClient().createMessage(msg.channel.id, result.message);
        }
        resolve(true);
      } else if (result instanceof CommandResult) {
        const command = result.command;
        if (sudo || (await this.checkPerms(command, msg.author))) {
          try {
            await command.run(new CommandContext(this.bot, msg, result.args));
            if (!command.silent) {
              const user = chalk.magenta(
                `${msg.author.username}#${msg.author.discriminator}`
              );
              this.logger.log(
                `'${user}' ran command '${chalk.magenta(
                  command.getFullName()
                )}'`
              );
            }
          } catch (err) {
            this.logger.error(
              `Command '${command.getFullName()}' crashed: ${err.stack}`
            );
          }
        } else {
          const user = chalk.magenta(
            `${msg.author.username}#${msg.author.discriminator}`
          );
          const commandName = chalk.magenta(command.getFullName());
          this.logger.log(
            `'${user}' did not have permission to run command '${commandName}'`
          );
          if (!command.silent) {
            this.bot
              .getClient()
              .createMessage(
                msg.channel.id,
                ":lock: You do not have permission to use this command"
              );
          }
        }
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  public parseFull(msgContent: string): CommandResult | CommandError {
    const prefix = startsWithAny(msgContent, this.prefixes);
    if (prefix) {
      const result = this.parseContent(msgContent.slice(prefix.length));
      return result;
    }
    return null;
  }

  public parseContent(
    content: string,
    commands: CommandOrGroup[] = this.getAllElements(),
    parent?: CommandOrGroup
  ): CommandResult | CommandError {
    const handleCommand = (
      command: Command,
      content: string
    ): CommandResult | CommandError => {
      const args = new Map<string, any>();
      if (command.args.length > 0) {
        for (const arg of command.args) {
          const types = arg.types;
          if (content != null && content.length > 0) {
            let finalResult = new CommandError(
              `No suitable arguement was provided for '${arg.name}'` +
                `\nAcceptable types: [${types.join(", ")}]`
            );
            for (const type of types) {
              const result = type.validate(content, this.bot);
              if (result.failed) {
                if (types.length === 1) {
                  finalResult = new CommandError(
                    result.data as string,
                    command
                  );
                }
              } else {
                args.set(arg.name, result.data);
                if (result.subcontent == null) {
                  result.subcontent = "";
                }
                content = result.subcontent.trim();
                finalResult = null;
                break;
              }
            }
            if (finalResult) {
              if (types.find(type => type === ArgType.ANY)) {
                const parts = content.split(/ (.+)/);
                args.set(arg.name, parts[0]);
                content = parts[1];
              } else {
                return finalResult;
              }
            }
          } else {
            return new CommandError(
              `Arguement ${arg.name} was not provided`,
              command
            );
          }
        }
      }
      return new CommandResult(command, new ArgList(args, content));
    };

    for (const command of commands) {
      const alias = startsWithAny(content, command.getTriggers());
      if (alias) {
        const subcontent = content.slice(alias.length).trimLeft();
        if (command.getElementLoader().getAllElements().length > 0) {
          const result = this.parseContent(
            subcontent,
            command.getElementLoader().getAllElements(),
            command
          );
          if (!(result instanceof CommandError) && command instanceof Command) {
            return handleCommand(command, subcontent);
          } else {
            return result;
          }
        } else if (command instanceof Command) {
          return handleCommand(command, subcontent);
        } else {
          this.logger.warn(
            `Command '${command.getTriggers()[0]}' has nothing to run!`
          );
        }
      }
    }
    return content === ""
      ? parent === null
        ? new CommandError("No command was provided")
        : new CommandError(
            `No subcommand was provided for '${parent.getTriggers()[0]}'`,
            parent
          )
      : new CommandError(
          `I'm not sure what you meant by "${content.split(" ")[0]}"`
        );
  }

  // TODO: move to bot
  public checkPerms(command: CommandOrGroup, user: User): Promise<boolean> {
    return new Promise((resolve, reject) => {
      for (const permCheck of this.permChecks) {
        if (!permCheck(command, user)) {
          return resolve(false);
        }
      }
      resolve(true);
    });
  }

  public async getValue(name: string, defaultValue?: any): Promise<any> {
    const value = await this.collection().findOne({ key: name });
    if (defaultValue === undefined) {
      return value;
    } else {
      return value == null ? defaultValue : value;
    }
  }

  public collection(): Collection {
    return this.bot.db().collection("command-manager");
  }
}
