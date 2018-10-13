import { Command, CommandConstructionData, CommandContext } from "../../..";

const CODE_LENGTH = 1900;

export default class extends Command {
  constructor(data: CommandConstructionData) {
    super(data, {
      name: "show code",
    });
  }
  public async run(context: CommandContext) {
    const path = context.args.content;
    const code = require(path).toString();
    for (let i = 0; i < code.length; i += CODE_LENGTH) {
      const start = i;
      let end = i + CODE_LENGTH;
      if (code.substring(end).length > 0) { while (code.substring(end, end + 1) !== "\n") { end--; } }
      context.say(`\`\`\`js\n${code.substring(start, end)}\n\`\`\``);
      i -= end - CODE_LENGTH - i;
    }
  }
}
