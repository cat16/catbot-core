import { CommandPermissionFunc } from ".";
import { CommandChannelType } from "../util/bot";

export default interface CommandCreateInfo {
  aliases?: string[];
  channelTypes?: CommandChannelType[];
  hasPermission?: CommandPermissionFunc;
}

export function isCommandCreateInfo(object) {
  return object instanceof Object;
}
