import chalk from "chalk";
import { Message } from "eris";
import Command from ".";
import Bot from "../bot";
import DatabaseVariable from "../database/database-variable";
import { startsWithAny } from "../util";
import NamedElementSearcher from "../util/file-element/searcher";
import Logger from "../util/logger";
import ArgList from "./arg/list";
import ArgType from "./arg/type";
import CommandContext from "./context";
import CommandDBKs from "./dbk";
import CommandError from "./error";
import CustomError from "./error/custom";
import InvalidArgumentProvided from "./error/invalid-arg-provided";
import NoArgumentProvided from "./error/no-arg-provided";
import NoCommandProvided from "./error/no-command-provided";
import UnknownCommand from "./error/unknownCommand";
import CommandSuccess from "./result";
import RunnableCommand from "./runnable";
import Trigger from "./trigger";

export type CommandResult = CommandSuccess | CommandError;

export default class CommandManager extends NamedElementSearcher<Command> {
  private bot: Bot;
  private logger: Logger;

  private prefixes: string[];
  private lastTriggered: object;

  constructor(bot: Bot) {
    super(" ");
    this.prefixes = [`${bot.getClient().user.mention} `];
    this.lastTriggered = {};
    this.bot = bot;
    this.logger = new Logger("command-manager", bot.getLogger());
  }

  public handleMessage(msg: Message): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const result = this.parseFull(msg.content);
      if (result && (await this.shouldRespond(result))) {
        const cooldown: number = await this.getValue(
          CommandDBKs.CommandCooldown,
          0
        );
        if (cooldown !== 0) {
          const lastTriggered: Trigger = this.lastTriggered[msg.author.id];
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

  public shouldRespond(result: CommandResult): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const silent = await this.getValue(CommandDBKs.Silent, false);
      const respondToUnknownCommands = await this.getValue(
        CommandDBKs.RespondToUnknownCommands,
        false
      );
      resolve(
        !(silent && result instanceof CommandError) &&
          (result != null || respondToUnknownCommands)
      );
    });
  }

  public runResult(
    result: CommandResult,
    msg: Message,
    sudo: boolean = false
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (result instanceof CommandError) {
        if (await this.shouldRespond(result)) {
          this.bot
            .getClient()
            .createMessage(msg.channel.id, result.getMessage());
        }
        resolve(true);
      } else if (result instanceof CommandSuccess) {
        const command = result.command;
        if (sudo || (await this.checkPerms(command, msg.author))) {
          try {
            await command.run(new CommandContext(this.bot, msg, result.args));
            if (!command.isSilent()) {
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
          if (!command.isSilent()) {
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

  public parseFull(msgContent: string): CommandResult {
    const prefix = startsWithAny(msgContent, this.prefixes);
    if (prefix) {
      const result = this.parseContent(msgContent.slice(prefix.length));
      return result;
    }
    return null;
  }

  public parseContent(content: string): CommandResult {
    const result = this.search(content);
    const command = result.element;
    if (command) {
      if (command instanceof RunnableCommand) {
        return this.handleCommand(command, result.leftover);
      } else {
        if (result.leftover.length === 0) {
          return new NoCommandProvided(command);
        } else {
          return new UnknownCommand(result.leftover, command);
        }
      }
    }
    if (content.length > 0) {
      return new UnknownCommand(content);
    }
    return new NoCommandProvided();
  }

  // TODO: move to bot
  public checkPerms(command: Command, user: User): Promise<boolean> {
    return new Promise((resolve, reject) => {
      for (const permCheck of this.permChecks) {
        if (!permCheck(command, user)) {
          return resolve(false);
        }
      }
      resolve(true);
    });
  }

  public async getValue<T>(
    key: CommandDBKs<T>,
    defaultValue?: any
  ): Promise<T> {
    return this.bot.getDatabase().get(key, defaultValue);
  }

  public async setValue<T>(key: CommandDBKs<T>, value: any): Promise<void> {
    return this.bot.getDatabase().set(key, value);
  }

  private handleCommand(
    command: RunnableCommand,
    content: string
  ): CommandResult {
    const args = new Map<string, any>();
    if (command.getArgs().length > 0) {
      for (const arg of command.getArgs()) {
        const types = arg.types;
        if (content != null && content.length > 0) {
          let finalResult: CommandError = new InvalidArgumentProvided(
            arg.name,
            content,
            command
          );
          for (const type of types) {
            const result = type.validate(content, this.bot);
            if (result.failed) {
              if (types.length === 1) {
                finalResult = new CustomError(result.data as string, command);
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
          return new NoArgumentProvided(arg.name, command);
        }
      }
    }
    return new CommandSuccess(command, new ArgList(args, content));
  }

  private createVariable<T>(name): DatabaseVariable<T> {}
}
