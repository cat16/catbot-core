import CommandContext from "./context";
import CommandCreateInfo from "./create-info";
import RunnableCommand from "./runnable";

export type CommandRunFunc = (
  this: RunnableCommand,
  context: CommandContext
) => void;

export default interface RunnableCommandCreateInfo extends CommandCreateInfo {
  run: CommandRunFunc;
}
