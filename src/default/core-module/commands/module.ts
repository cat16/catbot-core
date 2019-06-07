import CommandCreateInfo from "../../../lib/command/create-info";

const createInfo: CommandCreateInfo = {
  aliases: ["modules"],
  async hasPermission(context) {
    return this.bot.isAdmin(context.user.id);
  }
};

export default createInfo;
