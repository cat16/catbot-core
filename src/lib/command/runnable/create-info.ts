import RunnableCommand from ".";
import Arg from "../arg";
import CommandCreateInfo from "../create-info";
import CommandRunContext from "./run-context";

export type CommandRunFunc = (
  this: RunnableCommand,
  context: CommandRunContext
) => Promise<void> | void;

export default interface RunnableCommandCreateInfo extends CommandCreateInfo {
  args?: Arg<any>[];
  run: CommandRunFunc;
}

export function isRunnableCommandCreateInfo(object) {
  return object
    ? (object as RunnableCommandCreateInfo).run !== undefined
    : false;
}
