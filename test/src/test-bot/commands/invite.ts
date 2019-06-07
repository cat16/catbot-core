import { CommandCreateInfo } from "../../../../src";

const createInfo: CommandCreateInfo = {
  async run(context) {
    context.info(
      "Here's a link to invite the bot to your servers:" +
        "\nhttps://discordapp.com/oauth2/authorize?client_id=" +
        this.bot.client.user.id +
        "&scope=bot"
    );
  }
};

export default createInfo;
