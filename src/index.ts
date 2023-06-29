import { TelegramModuleServiceClass } from "./telegramModule/telegramModule.service-class";
import { initLocalDb } from "./db/initLocalDb";
import { Logger } from "./logger/logger";
import cron from "node-cron";
import { StatsModuleServiceClass } from "./statsModule/statsModule.service-class";

const logger = new Logger();
const telegramClass = new TelegramModuleServiceClass();
const statsClass = new StatsModuleServiceClass();

initLocalDb().then((result) => logger.info("Server connected to db"));

telegramClass
  .botLaunch()
  .then((result) => logger.info("Bot has been launched"));

cron.schedule("0 0 0 * * *", async () => {
  await statsClass.createStats();
});
