import { Message } from "eris";
import * as util from "util";
import { Command, CommandConstructionData, CommandContext } from "../../..";

const depth = 0;

export default class extends Command {
  constructor(data: CommandConstructionData) {
    super(data, {
      name: "eval",
    });
  }
  public async run(data: CommandContext) {
    const sending = data.say("Processing...");
    try {
      const result = await eval(data.args.content);
      let output = result;
      if (typeof (output) !== "string") {
        output = util.inspect(result, { depth });
      }
      const type =
        result === null ? "null"
          : result === undefined ? "undefined"
            : typeof (result) === "object" ? "object - " + result.constructor.name
              : typeof (result);
      const promise = output.startsWith("Promise {");
      const sent = await sending;
      sent.edit({
        content: "",
        embed: {
          fields: [
            {
              name: "Input",
              value: "```js\n" + data.args.content + "```",
            },
            {
              name: "Output",
              value: "```js\n" + output.replace(data.bot.getConfig().token, "[TOKEN]").slice(0, 1000) + "```",
            },
            {
              name: "Type",
              value: "```js\n" + type + "```",
            },
          ],
          timestamp: new Date().toDateString(),
          color: promise ? 0xffff00 : 0x00ff00,
        },
      });
    } catch (err) {
      const sent = await sending;
      sent.edit({
        content: "",
        embed: {
          fields: [
            {
              name: "Input",
              value: "```js\n" + data.args.content + "```",
            },
            {
              name: "Exception",
              value: "```js\n" + err.message + "```",
            },
            {
              name: "Stack",
              value: "```js\n" + err.stack.slice(0, 1000) + "```",
            },
            {
              name: "Type",
              value: "```js\n" + err.name + "```",
            },
          ],
          timestamp: new Date().toDateString(),
          color: 0xff0000,
        },
      });
    }
  }
}
