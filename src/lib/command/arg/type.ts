import { array } from "../../util";
import ArgFailure from "./result/fail";
import ArgSuccess from "./result/success";
import ArgTypeOptions, { ValidateFunction } from "./type-options";

export default class ArgType<T> {
  public static readonly WORD = new ArgType({
    validate: (text, bot) => {
      const word = text.split(" ")[0];
      return new ArgSuccess(word, text.substring(word.length).trimLeft());
    }
  });

  public static readonly USER = new ArgType({
    validate: (text, bot) => {
      const parts = text.split(" ", 2);
      const user = bot.util.getUser(parts[0]);
      if (user) {
        return new ArgSuccess(user, parts[1]);
      } else {
        return new ArgFailure(
          `User ${parts[0]} does not exist or cannot be found`
        );
      }
    }
  });
  public static readonly TEXT_CHANNEL = new ArgType({
    validate: (text, bot) => {
      const parts = text.split(" ", 2);
      const channel = bot.util.getTextChannel(parts[0]);
      if (channel) {
        return new ArgSuccess(channel, parts[1]);
      } else {
        return new ArgFailure(
          `Text channel ${parts[0]} does not exist or cannot be found`
        );
      }
    }
  });
  public static readonly DM_CHANNEL = new ArgType({
    validate: (text, bot) => {
      const parts = text.split(" ", 2);
      const channel = bot.util.getDMChannel(parts[0]);
      if (channel) {
        return new ArgSuccess(channel, parts[1]);
      } else {
        return new ArgFailure(
          `DM channel ${parts[0]} does not exist or cannot be found`
        );
      }
    }
  });
  public static readonly VOICE_CHANNEL = new ArgType({
    validate: (text, bot) => {
      const parts = text.split(" ", 2);
      const channel = bot.util.getVoiceChannel(parts[0]);
      if (channel) {
        return new ArgSuccess(channel, parts[1]);
      } else {
        return new ArgFailure(
          `Voice channel ${parts[0]} does not exist or cannot be found`
        );
      }
    }
  });
  public static readonly COMMAND = new ArgType({
    validate: (text, bot) => {
      const match = bot.commandManager.findMatch(text, {
        allowIncomplete: false
      });
      if (match) {
        return new ArgSuccess(match.element, match.leftover);
      } else {
        return new ArgFailure(`'${text}' is not a command`);
      }
    }
  });

  public static STRING(allowed: string[]) {
    return new ArgType({
      validate: (text, bot) => {
        const match = allowed.find(str => str === text);
        if (match) {
          return new ArgSuccess(match, text.slice(match.length).trim());
        } else {
          return new ArgFailure(
            `'${text}' did not start with a valid string` +
              `\nValid strings: ${allowed.map(str => `'${str}'`).join(", ")}`
          );
        }
      }
    });
  }

  public static BOOLEAN(
    trueStrs: string | string[] = "true",
    falseStrs: string | string[] = "false"
  ) {
    const trueStrsArr = array(trueStrs);
    const falseStrsArr = array(falseStrs);
    return new ArgType({
      validate: (text, bot) => {
        const trueMatch = trueStrsArr.find(str => text.startsWith(str));
        const falseMatch = falseStrsArr.find(str => text.startsWith(str));
        const match = trueMatch || falseMatch;
        if (match) {
          return new ArgSuccess(
            match === trueMatch,
            text.slice(trueMatch.length).trim()
          );
        } else {
          return new ArgFailure(
            `'${text}' did not start with a valid string` +
              `\nValid strings: ${trueStrsArr
                .concat(falseStrsArr)
                .map(str => `'${str}'`)
                .join(", ")}`
          );
        }
      }
    });
  }

  public readonly validate: ValidateFunction<T>;

  constructor(options: ArgTypeOptions<T>) {
    this.validate = options.validate;
  }
}
