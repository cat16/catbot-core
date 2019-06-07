import { CommandCreateInfo } from "../../../..";

const createInfo: CommandCreateInfo = {
  async run(context) {
    context.list(
      "Installed Modules",
      this.bot.getModules().map(m => {
        return {
          description: `${m.description || "No description provided."}`,
          name: `:small_blue_diamond: ${m.name}`
        };
      }),
      ":diamond_shape_with_a_dot_inside:"
    );
  }
};

export default createInfo;
