import CommandContext from "../context";
import CommandCreateInfo from "./create-info";

export type CommandRunFunc = (context: CommandContext) => void;

export default interface RunnableCommandCreateInfo extends CommandCreateInfo {
  run: CommandRunFunc;
}
