import chalk from "chalk";
import { DMChannel, GuildChannel, Message, TextBasedChannelFields, User } from "discord.js";
import Command, { CommandChannelType } from ".";
import Bot from "../bot";
import SavedVariable from "../database/saved-variable";
import { reportErrors, startsWithAny } from "../util";
import { formatUser } from "../util/bot";
import NamedElementSearcher from "../util/file-element/searcher";
import Logger from "../util/logger";
import Arg from "./arg";
import ArgList from "./arg/list";
import ArgFailure from "./arg/result/fail";
import ValidatorContext from "./arg/validator/context";
import DMValidatorContext from "./arg/validator/dm-context";
import GuildValidatorContext from "./arg/validator/guild-context";
import CommandError from "./error"; // lmao I might wanna add exprts to this so I don't have 200 import lines
import CooldownError from "./error/cooldown";
import InvalidArgumentProvided from "./error/invalid-arg-provided";
import NoArgumentProvided from "./error/no-arg-provided";
import NoCommandProvided from "./error/no-command-provided";
import PermissionError from "./error/permission";
import CommandErrorType from "./error/type";
import UnknownCommand from "./error/unknownCommand";
import Cooldown from "./trigger";
import RunnableCommand from "./runnable";
import CommandRunContext from "./runnable/run-context";

export interface CommandMatch {
  command: RunnableCommand;
  content: string;
}

export default class CommandManager extends NamedElementSearcher<Command> {
  public readonly bot: Bot;
  public readonly logger: Logger;

  public readonly prefixes: SavedVariable<string[]>;
  public readonly silent: SavedVariable<boolean>;
  public readonly respondToUnknownCommands: SavedVariable<boolean>;
  public readonly respondToBotAccounts: SavedVariable<boolean>;
  public readonly cooldownTime: SavedVariable<number>;

  private cooldowns: object;

  constructor(bot: Bot) {
    super(" ");
    this.bot = bot;
    this.prefixes = this.createVariable("prefixes", []);
    this.silent = this.createVariable("silent", false);
    this.respondToUnknownCommands = this.createVariable(
      "respondToUnkownCommands",
      false
    );
    this.respondToBotAccounts = this.createVariable(
      "respondToBotAccounts",
      false
    )
    this.cooldownTime = this.createVariable("cooldown", 0);
    this.cooldowns = {};
    this.logger = new Logger("command-manager", bot.logger);
  }

  public load() {
    this.bot.moduleManager
      .getElements()
      .forEach(m =>
        reportErrors(this.logger, "command", m.loadCommands())
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

  // TODO: bruh

  public handleMessage(
    msg: Message,
    sudo: boolean = false,
    silent: boolean = sudo ? true : false
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const content = this.parseMessage(msg);
      let error: CommandError = null;
      if (content) {
        const cooldown = this.cooldown(msg.author);
        if (typeof cooldown === "boolean") {
          if (cooldown) {
            resolve(false);
          } else {
            const result = this.parseContent(content);
            if (result instanceof CommandError) {
              error = result;
            } else {
              const command = result.command;
              const argList = this.parseArgs(result, msg);
              if (argList instanceof CommandError) {
                error = argList;
              } else {
                if (
                  sudo ||
                  (await this.bot.hasPermission({
                    command,
                    member: msg.member,
                    user: msg.author
                  }))
                ) {
                  const context = new CommandRunContext(msg, argList);
                  try {
                    await command.run(context);
                    if (!silent) {
                      this.logger.info(
                        `'${formatUser(
                          msg.author
                        )}' ran command '${chalk.magenta(
                          command.getFullName()
                        )}'`
                      );
                    }
                  } catch (err) {
                    const report = `Command '${command.getFullName()}' crashed: ${
                      err.stack
                    }`;
                    this.logger.error(report);
                    const channelStr = `channel: ${
                      msg.channel instanceof DMChannel
                        ? "DM channel"
                        : msg.channel.name
                    } [${msg.channel.id}]\n`;
                    const guildStr =
                      msg.channel instanceof GuildChannel
                        ? `guild: ${msg.channel.guild.name} [${
                            msg.channel.guild.id
                          }]\n`
                        : "";
                    await this.bot.report(
                      "A command crashed!",
                      `user: ${msg.author.username} [${msg.author.id}]\n` +
                        guildStr +
                        channelStr +
                        `\`\`\`${report}\`\`\``,
                      context
                    );
                    await context.error(
                      "The command crashed! A report was sent to the author of this bot."
                    );
                  }
                } else {
                  error = new PermissionError(command);
                }
              }
            }
          }
        } else {
          error = new CooldownError(Math.ceil(cooldown));
        }
      }
      if (error) {
        this.handleError(error, msg.author, msg.channel);
      }
    });
  }

  public handleError(
    error: CommandError,
    user: User,
    channel: TextBasedChannelFields
  ) {
    if (error.type === CommandErrorType.PERMISSION) {
      this.logger.info(
        `'${formatUser(user)}' tried to run ` +
          (error.command
            ? `command '${error.command.getFullName()}'`
            : `an unknown command` + " but didn't have permission")
      );
    }
    // TODO: I need to make the messages functions in run context universal so you don't need to have args
    if (this.shouldRespond(error)) {
      channel.send(`${error.type} ` + error.getMessage());
    }
  }

  public cooldown(user: User): boolean | number {
    const cooldownTime = this.cooldownTime.getValue();
    if (cooldownTime === 0) {
      return false;
    }
    const lastTriggered: Cooldown = this.cooldowns[user.id];
    if (lastTriggered != null) {
      const now = new Date().getTime();
      if (now - lastTriggered.time < cooldownTime) {
        if (lastTriggered.alreadyTold) {
          return true;
        } else {
          const ms = cooldownTime - (now - lastTriggered.time);
          this.cooldowns[user.id] = {
            alreadyTold: true,
            time: lastTriggered.time
          };
          return ms;
        }
      }
    }
    this.cooldowns[user.id] = {
      alreadyTold: false,
      time: new Date().getTime()
    };
    return false;
  }

  public shouldRespond(error?: CommandError): boolean {
    return !this.silent.get() && (error && error instanceof CommandError)
      ? error instanceof UnknownCommand &&
          !this.respondToUnknownCommands.getValue()
      : true;
  }

  /**
   * extracts a command string from a message
   * @param msg the message you want to extract a command from
   */
  public parseMessage(msg: Message): string {
    const prefix = startsWithAny(msg.content, this.prefixes.getValue());
    if (prefix) {
      return msg.content.slice(prefix.length).trim();
    }
    if (msg.channel instanceof DMChannel) {
      return msg.content;
    }
    return null;
  }

  public parseContent(content: string): CommandError | CommandMatch {
    const match = this.findMatch(content, { allowIncomplete: false });
    const command = match.element;
    if (command) {
      if (command instanceof RunnableCommand) {
        return { command, content: match.leftover };
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

  private parseArgs(match: CommandMatch, msg: Message): CommandError | ArgList {
    const command = match.command;
    let content = match.content;
    const args = new Map<Arg<any>, any>();
    if (command.getArgs().length > 0) {
      for (const arg of command.getArgs()) {
        const validators = arg.validationFuncs;
        if (content != null && content.length > 0) {
          let failures: ArgFailure[] = [];
          for (const validator of validators) {
            const context: ValidatorContext = { bot: this.bot, msg };
            // TODO: use this lol, except use built in djs stuff
            let commandChannelType: CommandChannelType = CommandChannelType.ANY;
            if (msg.channel instanceof GuildChannel && msg.member) {
              (context as GuildValidatorContext).member = msg.member;
              (context as GuildValidatorContext).channel = msg.channel;
              (context as GuildValidatorContext).guild = msg.channel.guild;
              commandChannelType = CommandChannelType.GUILD;
            }
            if (msg.channel instanceof DMChannel) {
              (context as DMValidatorContext).channel = msg.channel;
              (context as DMValidatorContext).user = msg.author;
              commandChannelType = CommandChannelType.PRIVATE;
            }
            const result = validator.validate(content, context); // TODO: figure out how 2 context here (generate context that is one of the 2 types, 3rd doesn't care lel)
            if (result instanceof ArgFailure) {
              failures.push(result);
            } else {
              args.set(arg, result.data);
              content = result.remaining ? result.remaining.trim() : "";
              failures = [];
              break;
            }
          }
          if (failures.length > 0) {
            return new InvalidArgumentProvided(arg, failures, command);
          }
        } else {
          return new NoArgumentProvided(arg.name, command);
        }
      }
    }
    return new ArgList(args, content);
  }

  private createVariable<T>(key: string, initValue?: T): SavedVariable<T> {
    return this.bot.createSavedVariable(`command-manager.${key}`, initValue);
  }
}
