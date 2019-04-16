import { CommandCreateInfo } from "../../..";

const createInfo: CommandCreateInfo = {
  run(context) {
    context.info("Invite",
      `https://discordapp.com/oauth2/authorize?client_id=${
        this.bot.getClient().user.id
      }&permissions=0&scope=bot`
    );
  }
};

export default createInfo;
