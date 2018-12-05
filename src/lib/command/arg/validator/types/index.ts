import BooleanValidator from "./boolean";
import CommandValidator from "./command";
import DMChannelValidator from "./dm-channel";
import StringValidator from "./string";
import TextChannelValidator from "./text-channel";
import UserValidator from "./user";
import VoiceChannelValidator from "./voice-channel";
import WordValidator from "./word";

export default {
  BOOLEAN: BooleanValidator,
  COMMAND: CommandValidator,
  DM_CHANNEL: DMChannelValidator,
  STRING: StringValidator,
  TEXT_CHANNEL: TextChannelValidator,
  USER: UserValidator,
  VOICE_CHANNEL: VoiceChannelValidator,
  WORD: WordValidator
};
