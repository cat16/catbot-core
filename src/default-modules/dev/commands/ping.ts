import { Command, CommandConstructionData, CommandContext } from "../../..";

export default class extends Command {
  constructor(data: CommandConstructionData) {
    super(data, {
      name: "ping",
    });
  }
  public run(data: CommandContext) {
    const now = new Date();
    data.say("Ping: loading...").then((sent) => {
      const then = new Date();
      sent.edit(`Ping: ${then.getTime() - now.getTime()}ms`);
    });
  }
  public hasPermission(): boolean {
    return true;
  }
}
