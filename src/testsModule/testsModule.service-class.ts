import { WordsModuleServiceClass } from "../wordsModule/wordsModule.service-class";
import { StatsModuleServiceClass } from "../statsModule/statsModule.service-class";
import { PuppeteerModuleServiceClass } from "../puppeteerModule/puppeteerModule.service-class";
import { Logger } from "winston";
import { NotFoundErrorStatusClass } from "../types/statuses/errors.classes";
import { FirstLevelTestInterface } from "../types/statuses/firstLevelTest.interface";
import { StatusInterface } from "../types/statuses/status.interface";
import { SecondLevelTestInterface } from "../types/statuses/secondLevelTest.interface";
import { WordsInterface } from "../types/words.interface";
import { ThirdLevelTestInterface } from "../types/statuses/thirdLevelTest.interface";

const logger = new Logger();

const wordsService = new WordsModuleServiceClass();
const statsService = new StatsModuleServiceClass();
const puppeteerService = new PuppeteerModuleServiceClass();

export class TestsModuleServiceClass {
  private async getWordsForTestFromDb(
    isOneWord: boolean
  ): Promise<WordsInterface[] | StatusInterface> {
    try {
      const allWordsArray = await wordsService.getAllWords();
      if (!allWordsArray.length) {
        return new NotFoundErrorStatusClass(`There is no words in database`);
      }

      let unusedWordsArray = await wordsService.getUnusedWords();

      if (!unusedWordsArray.length) {
        const setAllWordsUnusedResult = await wordsService.setAllWordsUnused();
        logger.info(setAllWordsUnusedResult.message);
      }

      unusedWordsArray = await wordsService.getUnusedWords();
      if (isOneWord) {
        const wordsForTestArray = unusedWordsArray
          .sort(() => 0.5 - Math.random())
          .slice(0, 1);

        const setWordUsedResult = await wordsService.setWordUsed(
          wordsForTestArray[0].id
        );
        logger.info(setWordUsedResult.message);

        return wordsForTestArray;
      } else {
        const wordsForTestArray = unusedWordsArray
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

        const setWordUsedResult = await wordsService.setWordUsed(
          wordsForTestArray[0].id
        );
        logger.info(setWordUsedResult.message);

        return wordsForTestArray;
      }
    } catch (error: any) {
      throw error;
    }
  }

  public async generateFirstLevelTest(): Promise<
    FirstLevelTestInterface | StatusInterface
  > {
    try {
      const wordsForTestResult = await this.getWordsForTestFromDb(false);
      if ("status" in wordsForTestResult) {
        return wordsForTestResult;
      }

      return {
        translatedVersion: wordsForTestResult[0].translated_version,
        rightAnswer: wordsForTestResult[0].english_version,
        answersArray: wordsForTestResult.map((word) => word.english_version),
      };
    } catch (error: any) {
      throw error;
    }
  }

  public async generateSecondLevelTest(): Promise<
    SecondLevelTestInterface | StatusInterface
  > {
    try {
      const wordsForTestResult = await this.getWordsForTestFromDb(true);
      if ("status" in wordsForTestResult) {
        return wordsForTestResult;
      }

      return {
        translatedVersion: wordsForTestResult[0].translated_version,
        rightAnswer: wordsForTestResult[0].english_version,
      };
    } catch (error: any) {
      throw error;
    }
  }

  public async generateThirdLevelTest(): Promise<
    ThirdLevelTestInterface | StatusInterface
  > {
    try {
      const wordsForTestResult = await this.getWordsForTestFromDb(true);
      if ("status" in wordsForTestResult) {
        return wordsForTestResult;
      }

      const randomSentence =
        await puppeteerService.getRandomSentenceWithExactWord(
          wordsForTestResult[0].english_version
        );

      return {
        rightAnswer: wordsForTestResult[0].english_version,
        sentence: randomSentence,
      };
    } catch (error: any) {
      throw error;
    }
  }

  public async handleTestResult(isAnswerRight: boolean, testLevel: number) {
    try {
      let updateStatsResult;
      if (isAnswerRight) {
        updateStatsResult = await statsService.updateStats(testLevel, 1, 0);
      } else {
        updateStatsResult = await statsService.updateStats(0, 0, 1);
      }
      logger.info(updateStatsResult.message);
    } catch (error: any) {
      throw error;
    }
  }
}
