export default interface CommandCreateInfo {
  aliases?: string[];
  silent?: boolean;
}

export function isCommandCreateInfo(object) {
  return object instanceof Object;
}
