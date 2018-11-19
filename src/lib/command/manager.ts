import chalk from "chalk";
import { Message } from "eris";
import Command from ".";
import Bot from "../bot";
import DatabaseVariable from "../database/database-variable";
import { array, reportErrors, startsWithAny } from "../util";
import NamedElementSearcher from "../util/file-element/searcher";
import Logger from "../util/logger";
import Arg from "./arg";
import ArgList from "./arg/list";
import ArgFailure from "./arg/result/fail";
import ArgType from "./arg/type";
import CommandError from "./error";
import CustomError from "./error/custom";
import InvalidArgumentProvided from "./error/invalid-arg-provided";
import NoArgumentProvided from "./error/no-arg-provided";
import NoCommandProvided from "./error/no-command-provided";
import UnknownCommand from "./error/unknownCommand";
import CommandSuccess from "./result";
import CommandRunContext from "./run-context";
import RunnableCommand from "./runnable";
import Trigger from "./trigger";

export type CommandResult = CommandSuccess | CommandError;

export default class CommandManager extends NamedElementSearcher<Command> {
  public readonly bot: Bot;
  public readonly logger: Logger;

  public readonly prefixes: DatabaseVariable<string[]>;
  public readonly silent: DatabaseVariable<boolean>;
  public readonly respondToUnknownCommands: DatabaseVariable<boolean>;
  public readonly cooldown: DatabaseVariable<number>;

  private lastTriggered: object;

  constructor(bot: Bot) {
    super(" ");
    this.bot = bot;
    this.prefixes = this.createVariable("prefixes", () => [
      `${bot.getClient().user.mention} `
    ]);
    this.silent = this.createVariable("silent", false);
    this.respondToUnknownCommands = this.createVariable(
      "respondToUnkownCommands",
      false
    );
    this.cooldown = this.createVariable("cooldown", 0);
    this.lastTriggered = {};
    this.logger = new Logger("command-manager", bot.logger);
  }

  public load() {
    this.bot.moduleManager
      .getElements()
      .forEach(m =>
        reportErrors(this.logger, "command", m.commandDirManager.load())
      );
    this.logger.success(
      `Successfully loaded ${this.getElements().length} commands.`
    );
  }

  public getElements(): Command[] {
    return [].concat(
      ...this.bot.moduleManager
        .getElements()
        .map(m => m.commandDirManager.getElements())
    );
  }

  public handleMessage(msg: Message): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const result = this.parseFull(msg.content);
      if (result) {
        const cooldown = this.cooldown.getValue();
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

  public shouldRespond(result: CommandResult): boolean {
    return (
      !(this.silent.getValue() && result instanceof CommandError) &&
      !(
        result instanceof UnknownCommand &&
        !this.respondToUnknownCommands.getValue()
      )
    );
  }

  public runResult(
    result: CommandResult,
    msg: Message,
    sudo: boolean = false
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      if (result instanceof CommandError) {
        if (
          !this.silent.getValue() &&
          (result instanceof UnknownCommand &&
            !this.respondToUnknownCommands.getValue())
        ) {
          this.bot
            .getClient()
            .createMessage(msg.channel.id, result.getMessage());
        }
        resolve(true);
      } else if (result instanceof CommandSuccess) {
        const command = result.command;
        if (
          sudo ||
          (await this.bot.hasPermission({
            user: msg.author,
            command,
            member: msg.member
          }))
        ) {
          try {
            await command.run(new CommandRunContext(msg, result.args));
            if (!command.silent.getValue()) {
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
          if (!command.silent.getValue()) {
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
    const prefix = startsWithAny(msgContent, this.prefixes.getValue());
    if (prefix) {
      const result = this.parseContent(msgContent.slice(prefix.length));
      return result;
    }
    return null;
  }

  public parseContent(content: string): CommandResult {
    const match = this.findMatch(content, { allowIncomplete: false });
    const command = match.element;
    if (command) {
      if (command instanceof RunnableCommand) {
        return this.handleCommand(command, match.leftover);
      } else {
        if (match.leftover.length === 0) {
          return new NoCommandProvided(command);
        } else {
          return new UnknownCommand(match.leftover, command);
        }
      }
    }
    if (content.length > 0) {
      return new UnknownCommand(content);
    }
    return new NoCommandProvided();
  }

  private handleCommand(
    command: RunnableCommand,
    content: string
  ): CommandResult {
    const args = new Map<Arg<any>, any>();
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
            if (result instanceof ArgFailure) {
              if (types.length === 1) {
                finalResult = new CustomError(result.reason, command);
              }
            } else {
              args.set(arg, result.data);
              content = result.remaining ? result.remaining.trim() : "";
              finalResult = null;
              break;
            }
          }
          if (finalResult) {
            if (types.find(type => type === ArgType.WORD)) {
              const parts = content.split(" ", 2);
              args.set(arg, parts[0]);
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

  private createVariable<T>(
    key: string | string[],
    defaultValue?: T | (() => T)
  ): DatabaseVariable<T> {
    return this.bot.createDatabaseVariable(
      ["command-manager", ...array(key)],
      defaultValue
    );
  }
}
