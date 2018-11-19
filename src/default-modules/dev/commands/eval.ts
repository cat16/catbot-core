import { MessageContent } from "eris";
import { inspect } from "util";
import { Bot, CommandCreateInfo } from "../../..";

const depth = 0;

const createEvalMsg = (
  bot: Bot,
  input: string,
  content: any,
  type: string,
  color: number
): MessageContent => {
  const output =
    content instanceof Error
      ? [
          {
            name: "Exception",
            value: "```js\n" + content.message + "```"
          },
          {
            name: "Stack",
            value: "```js\n" + content.stack.slice(0, 1000) + "```"
          }
        ]
      : [
          {
            name: "Output",
            value:
              "```js\n" +
              content.replace(bot.getConfig().token, "[TOKEN]").slice(0, 1000) +
              "```"
          }
        ];
  return {
    content: "",
    embed: {
      fields: [
        {
          name: "Input",
          value: "```js\n" + input + "```"
        },
        ...output,
        {
          name: "Type",
          value: "```js\n" + type + "```"
        }
      ],
      timestamp: new Date().toISOString(),
      color
    }
  };
};

const createInfo: CommandCreateInfo = {
  async run(context) {
    const sending = context.say(
      createEvalMsg(
        this.bot,
        context.args.content,
        "evaluating...",
        "evaluating...",
        0xffff00
      )
    );
    try {
      // tslint:disable-next-line:no-eval
      const result = await eval(context.args.content);
      let output = result;
      if (typeof output !== "string") {
        output = inspect(result, { depth });
      }
      const type =
        result === null
          ? "null"
          : result === undefined
            ? "undefined"
            : typeof result === "object"
              ? "object - " + result.constructor.name
              : typeof result;
      const promise = output.startsWith("Promise {");
      const sent = await sending;
      sent.edit(
        createEvalMsg(
          this.bot,
          context.args.content,
          output,
          type,
          promise ? 0xffff00 : 0x00ff00
        )
      );
    } catch (err) {
      const sent = await sending;
      sent.edit(
        createEvalMsg(this.bot, context.args.content, err, err.name, 0xff0000)
      );
    }
  },
  async hasPermission(context) {
    return this.bot.isAdmin(context.user.id);
  }
};

export default createInfo;
