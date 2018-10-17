import { Command, CommandConstructionData, CommandContext } from "../../../src";

export default class extends Command {
  constructor(data: CommandConstructionData) {
    super(data, {
      name: "test"
    });
  }
  public async run(context: CommandContext) {
    context.say("the test command was run");
  }
}
