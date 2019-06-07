// TODO: bruh

import chalk from "chalk";
import {
  DMChannel,
  GuildChannel,
  Message,
  TextBasedChannelFields,
  User
} from "discord.js";
import Command from ".";
import Bot from "../bot";
import SavedVariable from "../database/saved-variable";
import { reportErrors, startsWithAny } from "../util";
import { formatErrorResponse, formatUser } from "../util/bot";
import Logger from "../util/console/logger";
import NamedElementSearcher from "../util/file-element/searcher";
import Arg from "./arg";
import ArgList from "./arg/list";
import ArgFailure from "./arg/result/fail";
import ValidatorContext from "./arg/validator/context";
import CommandError from "./error";
import CooldownError from "./error/cooldown";
import CrashedError from "./error/crashed";
import IgnoredForCooldownError from "./error/ignored/cooldown";
import InvalidArgumentProvided from "./error/invalid-arg-provided";
import InvalidChannelType from "./error/invalid-channel-type";
import NoArgumentProvided from "./error/no-arg-provided";
import NoCommandProvided from "./error/no-command-provided";
import PermissionError from "./error/permission";
import CommandErrorType from "./error/type";
import UnknownCommand from "./error/unknownCommand";
import RunnableCommand from "./runnable";
import CommandRunContext from "./runnable/run-context";
import Cooldown from "./trigger";

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
    );
    this.cooldownTime = this.createVariable("cooldown", 0);
    this.cooldowns = {};
    this.logger = new Logger("command-manager", bot.logger);
  }

  public load() {
    this.bot.moduleManager
      .getElements()
      .forEach(m => reportErrors(this.logger, "command", m.loadCommands()));
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

  public handleMessage(
    msg: Message,
    sudo: boolean = false,
    silent: boolean = sudo ? true : false
  ): Promise<Command | CommandError | void> {
    return new Promise(async (resolve, reject) => {
      const content = this.parseMessage(msg);
      const handleError = (error: CommandError) => {
        this.handleError(error, msg.author, msg.channel);
        resolve(error);
      };
      if (content) {
        // cooldown check

        const cooldown = this.cooldown(msg.author);
        if (typeof cooldown === "number") {
          return handleError(new CooldownError(Math.ceil(cooldown)));
        }
        if (cooldown) {
          return resolve(new IgnoredForCooldownError());
        }

        // command check (does a command even exist & do they need a subcommand)

        const result = this.parseContent(content);
        if (result instanceof CommandError) {
          return handleError(result);
        }
        const command = result.command;

        // channel check

        if (!command.canBeRunInChannel(msg.channel)) {
          return handleError(new InvalidChannelType(command));
        }

        // permission check

        if (
          !(
            sudo ||
            (await this.bot.hasPermission({
              command,
              member: msg.member,
              user: msg.author
            }))
          )
        ) {
          return handleError(new PermissionError(command));
        }

        // arg check

        const argList = this.parseArgs(result, msg);
        if (argList instanceof CommandError) {
          return handleError(argList);
        }

        // run the command

        const context = new CommandRunContext(msg, argList);
        try {
          await command.run(context);
          if (!silent) {
            this.logger.info(
              `'${formatUser(msg.author)}' ran command '${chalk.magenta(
                command.toString()
              )}'`
            );
          }
          return resolve(command);
        } catch (err) {
          const report = `Command '${command}' crashed: ${err.stack}`;
          this.logger.error(report);
          const channelStr = `channel: ${
            msg.channel instanceof DMChannel ? "DM channel" : msg.channel.name
          } [${msg.channel.id}]\n`;
          const guildStr =
            msg.channel instanceof GuildChannel
              ? `guild: ${msg.channel.guild.name} [${msg.channel.guild.id}]\n`
              : "";
          await this.bot.report(
            "A command crashed!",
            `user: ${msg.author.username} [${msg.author.id}]\n` +
              guildStr +
              channelStr +
              `\`\`\`${report}\`\`\``,
            context
          );
          return handleError(new CrashedError(command, err));
        }
      }
      return resolve();
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
            ? `command '${error.command}'`
            : `an unknown command` + " but didn't have permission")
      );
    }
    if (this.shouldRespond(error)) {
      channel.send(formatErrorResponse(error, {}));
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
    return (
      !this.silent.getValue() &&
      (error instanceof UnknownCommand
        ? this.respondToUnknownCommands.getValue()
        : true)
    );
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
    const command = match ? match.element : null;
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
    if (command.args.length > 0) {
      for (const arg of command.args) {
        const validators = arg.validationFuncs;
        if (content != null && content.length > 0) {
          let failures: ArgFailure[] = [];
          for (const validator of validators) {
            const context: ValidatorContext<typeof msg.channel> = {
              bot: this.bot,
              msg,
              user:
                msg.channel instanceof GuildChannel ? msg.member : msg.author,
              channel: msg.channel,
              guild:
                msg.channel instanceof GuildChannel
                  ? msg.channel.guild
                  : undefined
            };
            const result = validator.validate(content, context);
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
