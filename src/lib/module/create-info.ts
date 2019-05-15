export default interface ModuleCreateInfo {
  aliases?: string[];
  description?: string;
}

export function isModuleCreateInfo(object: any): object is ModuleCreateInfo {
  return object instanceof Object;
}
