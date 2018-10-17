process.on("unhandledRejection", (reason, p) => {
  process.stderr.write(
    `Unhandled Rejection at: Promise${p}\nreason:${reason}\n`
  );
});

import { Bot, getInput } from "../../src";

const a = (async () => {
  process.stdout.write("Input the following:\n");
  const bot = new Bot(__dirname);
  bot.start();
})();
