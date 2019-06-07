import { TextChannel } from "discord.js";
import { Bot, CommandCreateInfo } from "../../../../src";
import { RESPONSE } from "../../../../src/lib/util/bot";

export function restart(bot: Bot, channelId: string, full: boolean) {
  bot.restart(full).then(async newBot => {
    const channel = newBot.client.channels.get(channelId) as TextChannel;
    const success = full
      ? (await import("../../../../src/lib/util/bot")).RESPONSE.success
      : RESPONSE.success;
    channel.send(
      success(`Successfully restarted (${full ? "full" : "light"})`)
    );
  });
}

const createInfo: CommandCreateInfo = {
  async run(context) {
    restart(this.bot, context.msg.channel.id, false);
  }
};

export default createInfo;
