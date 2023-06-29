import * as dotenv from "dotenv";
import { Input, Telegraf } from "telegraf";
import { WordsModuleServiceClass } from "../wordsModule/wordsModule.service-class";
import { StatsModuleServiceClass } from "../statsModule/statsModule.service-class";
import { TestsModuleServiceClass } from "../testsModule/testsModule.service-class";
import { message } from "telegraf/filters";
import { Logger } from "../logger/logger";

dotenv.config();

const bot = new Telegraf(<string>process.env.BOT_TOKEN);

const logger = new Logger();

const wordsService = new WordsModuleServiceClass();
const statsService = new StatsModuleServiceClass();
const testsService = new TestsModuleServiceClass();

export class TelegramModuleServiceClass {
  private IS_ANSWER_NEEDED = false;
  private CURRENT_TEST_LEVEL = 0;
  private CURRENT_TEST_RIGHT_ANSWER = "";

  public async botLaunch() {
    bot.start((ctx) => {
      ctx.reply("Вітаю вас! Цей бот допоможе вам вивчати англійську.");
      ctx.reply("Для огляду списку команд введіть /help");
    });

    bot.help((ctx) => {
      ctx.reply(
        "Введіть /add_word та слово англійською мовою, після чого воно додається у словник (кілька слів або фразу ввести не можна)"
      );
      ctx.reply("Введіть /get_words для отримання списку всіх ваших слів");
      ctx.reply(
        "Введіть /get_word та слово англійською мовою, для отримання конкретного слова та його переклад"
      );
      ctx.reply(
        "Введіть /delete_word та слово англійською мовою, для втдалення слова зі словника"
      );
      ctx.reply(
        "Введіть /get_stats для отримання графіків вашої статистики проходження тестів"
      );
      ctx.reply(
        "Введіть /test та рівень складності (1, 2 чи 3) для проходження тесту"
      );
    });

    bot.on(message("text"), async (ctx) => {
      const splitedMessage = ctx.message.text.split(" ");

      try {
        if (this.IS_ANSWER_NEEDED) {
          let isAnswerRight =
            ctx.message.text.trim() === this.CURRENT_TEST_RIGHT_ANSWER;
          await testsService.handleTestResult(
            isAnswerRight,
            this.CURRENT_TEST_LEVEL
          );
          if (isAnswerRight) ctx.reply("Ви відповіли правильно ✅");
          else ctx.reply("Ви відповіли неправильно ❌");
          this.IS_ANSWER_NEEDED = false;
          this.CURRENT_TEST_LEVEL = 0;
          this.CURRENT_TEST_RIGHT_ANSWER = "";
        }

        if (splitedMessage[0] === "/add_word") {
          if (splitedMessage.length > 2) {
            ctx.reply(
              "Вибачте, але зберігати одночастно декілька слів чи фразу не можна :)"
            );
          } else {
            const addWordResult = await wordsService.addNewWord(
              splitedMessage[1]
            );
            if ("status" in addWordResult) {
              logger.info(addWordResult.message);
              ctx.reply("Слово було успішно додане в словник");
            } else {
              ctx.reply(
                "Ви ввели слово з помилкою, серед слів нижче можливо є ваше слово :)"
              );
              ctx.reply(addWordResult.join(", "));
            }
          }
        }

        if (splitedMessage[0] === "/get_words") {
          const wordsArray = await wordsService.getAllWords();
          if (!wordsArray.length) {
            ctx.reply("Покищо словник пустий");
          } else {
            for (const word of wordsArray) {
              ctx.reply(
                `${word.english_version}     ${word.translated_version}`
              );
            }
          }
        }

        if (splitedMessage[0] === "/get_word") {
          const getWordResult = await wordsService.getWord(splitedMessage[1]);
          if ("status" in getWordResult) {
            logger.info(getWordResult.message);
            ctx.reply("Такого слова нема в вашому словнику");
          } else {
            ctx.reply(
              `${getWordResult.english_version}     ${getWordResult.translated_version}`
            );
          }
        }

        if (splitedMessage[0] === "/delete_word") {
          const deleteWordResult = await wordsService.deleteWord(
            splitedMessage[1]
          );
          if (deleteWordResult.status === "success") {
            logger.info(deleteWordResult.message);
            ctx.reply("Слово було видалено зі словника");
          } else {
            logger.info(deleteWordResult.message);
            ctx.reply("Такого слова нема в вашому словнику");
          }
        }

        if (splitedMessage[0] === "/get_stats") {
          const { scoreChartUrl, correctAnswersRatioChartUrl } =
            await statsService.generateChartStatistics();
          await ctx.replyWithPhoto(Input.fromURL(scoreChartUrl));
          await ctx.replyWithPhoto(Input.fromURL(correctAnswersRatioChartUrl));
        }

        if (splitedMessage[0] === "/test") {
          if (splitedMessage[1] === "1") {
            const firstLevelTest = await testsService.generateFirstLevelTest();
            if ("status" in firstLevelTest) {
              logger.info(firstLevelTest.message);
              ctx.reply("Ваш словник пустий");
            } else {
              if (firstLevelTest.answersArray.length < 3) {
                ctx.reply("У словнику недостатньо слів для цього тесту");
              } else {
                ctx.sendQuiz(
                  `Виберіть правильний переклад слова: ${firstLevelTest.translatedVersion}`,
                  firstLevelTest.answersArray,
                  {
                    is_anonymous: false,
                    correct_option_id: firstLevelTest.answersArray.indexOf(
                      firstLevelTest.rightAnswer
                    ),
                  }
                );
                bot.on("poll_answer", async (ctx) => {
                  const isAnswerRight =
                    firstLevelTest.answersArray[
                      ctx.update.poll_answer.option_ids[0]
                    ] === firstLevelTest.rightAnswer;
                  await testsService.handleTestResult(isAnswerRight, 1);
                });
              }
            }
          } else if (splitedMessage[1] === "2") {
            const secondLevelTest =
              await testsService.generateSecondLevelTest();
            if ("status" in secondLevelTest) {
              logger.info(secondLevelTest.message);
              ctx.reply("Ваш словник пустий");
            } else {
              ctx.sendMessage(
                `Введіть переклад слова: ${secondLevelTest.translatedVersion}`
              );
              this.IS_ANSWER_NEEDED = true;
              this.CURRENT_TEST_LEVEL = 2;
              this.CURRENT_TEST_RIGHT_ANSWER = secondLevelTest.rightAnswer;
            }
          } else if (splitedMessage[1] === "3") {
            const thirdLevelTest = await testsService.generateThirdLevelTest();
            if ("status" in thirdLevelTest) {
              logger.info(thirdLevelTest.message);
              ctx.reply("Ваш словник пустий");
            } else {
              ctx.reply("Введіть слово замість пропуску");
              ctx.reply(thirdLevelTest.sentence);
              this.IS_ANSWER_NEEDED = true;
              this.CURRENT_TEST_LEVEL = 3;
              this.CURRENT_TEST_RIGHT_ANSWER = thirdLevelTest.rightAnswer;
            }
          } else {
            ctx.reply("Ви ввели неіснуючий рівень для тесту");
          }
        }
      } catch (error: any) {
        logger.error(error.message);
        ctx.reply(
          "Вибачте, виникла проблема з базою даних, звʼяжіться з командою розробки :)"
        );
      }
    });

    await bot.launch();
  }
}
