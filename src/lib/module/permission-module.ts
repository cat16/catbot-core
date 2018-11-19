import Module from ".";
import Bot from "../bot";
import { CommandPermissionContext } from "../command/permission-context";
import PermissionModuleCreateInfo, {
  HasPermissionFunction
} from "./permission-create-info";

export default class PermissionModule extends Module {
  private hasPermissionFunc: HasPermissionFunction;

  constructor(
    fileName: string,
    bot: Bot,
    directory: string,
    createInfo: PermissionModuleCreateInfo
  ) {
    super(fileName, bot, directory, createInfo);
    this.hasPermissionFunc = createInfo.hasPermission;
  }

  public hasPermission(context: CommandPermissionContext): Promise<boolean> {
    return this.hasPermissionFunc.call(this, context);
  }
}
