process.on("unhandledRejection", (error, p) => {
  process.stderr.write(
    `Unhandled Promise Rejection - ${error.stack || error}\n`
  );
});

import { Bot } from "../../../src";

const a = (async () => {
  const bot = new Bot(__dirname);
  await bot.start();
})();
