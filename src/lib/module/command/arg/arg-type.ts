import ArgResult from "./arg-result";
import ArgTypeOptions, { ValidateFunction } from "./arg-type-options";

export default class ArgType {
  public static ANY = new ArgType({
    validate: (text, bot) => {
      const word = text.split(" ")[0];
      return new ArgResult(false, word, text.substring(word.length).trimLeft());
    }
  });
  public static USER = new ArgType({
    validate: (text, bot) => {
      const parts = text.split(/ (.+)/);
      const user = bot.getUtil().getUser(parts[0]);
      if (user) {
        return new ArgResult(false, user, parts[1]);
      } else {
        return new ArgResult(
          true,
          `User ${parts[0]} does not exist or cannot be found`
        );
      }
    }
  });
  public static TEXT_CHANNEL = new ArgType({
    validate: (text, bot) => {
      const parts = text.split(/ (.+)/);
      const channel = bot.getUtil().getTextChannel(parts[0]);
      if (channel) {
        return new ArgResult(false, channel, parts[1]);
      } else {
        return new ArgResult(
          true,
          `Text channel ${parts[0]} does not exist or cannot be found`
        );
      }
    }
  });
  public static DM_CHANNEL = new ArgType({
    validate: (text, bot) => {
      const parts = text.split(/ (.+)/);
      const channel = bot.getUtil().getDMChannel(parts[0]);
      if (channel) {
        return new ArgResult(false, channel, parts[1]);
      } else {
        return new ArgResult(
          true,
          `DM channel ${parts[0]} does not exist or cannot be found`
        );
      }
    }
  });
  public static VOICE_CHANNEL = new ArgType({
    validate: (text, bot) => {
      const parts = text.split(/ (.+)/);
      const channel = bot.getUtil().getVoiceChannel(parts[0]);
      if (channel) {
        return new ArgResult(false, channel, parts[1]);
      } else {
        return new ArgResult(
          true,
          `Voice channel ${parts[0]} does not exist or cannot be found`
        );
      }
    }
  });
  public static COMMAND = new ArgType({
    validate: (text, bot) => {
      const result = bot.getCommandManager().find(text);
      if (result) {
        return new ArgResult(false, result.data.element, result.remaining);
      } else {
        return new ArgResult(true, `'${text}' is not a command`);
      }
    }
  });

  public validate: ValidateFunction;

  constructor(options: ArgTypeOptions) {
    this.validate = options.validate;
  }
}
