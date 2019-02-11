import { CommandChannelType } from ".";

export default interface CommandCreateInfo {
  aliases?: string[];
  guildOnly?: CommandChannelType;
}

export function isCommandCreateInfo(object) {
  return object instanceof Object;
}
