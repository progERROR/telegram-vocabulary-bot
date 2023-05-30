import DBHandler from "../db/pg/index";
import { Logger } from "winston";
import {
  createWordQuery,
  deleteWordByEnglishVersionQuery,
  getAllUnusedWordsQuery,
  getAllWordsQuery,
  getWordByEnglishVersionQuery,
  setAllWordsUnusedQuery,
  setWordUsedQuery,
} from "./wordsModule.db-queries";
import { WordsInterface } from "../types/words.interface";
import { SuccessStatusClass } from "../types/statuses/successStatus.class";
import { StatusInterface } from "../types/statuses/status.interface";
import {
  DBErrorStatusClass,
  MoreThanOneWordErrorStatusClass,
  NotFoundErrorStatusClass,
} from "../types/statuses/errors.classes";

const Typo = require("typo-js");
const translate = require("@iamtraction/google-translate");

const dictionary = new Typo();

const logger = new Logger();
DBHandler.connect().then(() =>
  logger.info("[Words Service]: words service connected to db Pool;")
);

export class WordsModuleServiceClass {
  public async getAllWords(): Promise<WordsInterface[]> {
    logger.info(`Getting all words from db`);

    const getAllWordsString = getAllWordsQuery();
    const getAllWordsResponse = await DBHandler.executeQuery(getAllWordsString);

    return getAllWordsResponse.rows;
  }

  public async getUnusedWords(): Promise<WordsInterface[]> {
    logger.info(`Getting all unused words per current day from db`);

    const getAllUnusedWordsString = getAllUnusedWordsQuery();
    const getAllUnusedWordsResponse = await DBHandler.executeQuery(
      getAllUnusedWordsString
    );

    return getAllUnusedWordsResponse.rows;
  }

  public async getWord(
    englishVersion: string
  ): Promise<WordsInterface | StatusInterface> {
    logger.info(`Getting the word "${englishVersion}" from db`);

    const getWordString = getWordByEnglishVersionQuery(englishVersion);
    const getWordResponse = await DBHandler.executeQuery(getWordString);

    if (getWordResponse.rowCount) {
      return getWordResponse.rows[0];
    } else {
      return new NotFoundErrorStatusClass(
        `The word "${englishVersion}" is not found`
      );
    }
  }

  public async addNewWord(
    englishVersion: string
  ): Promise<WordsInterface | StatusInterface | string[]> {
    logger.info(`Adding new word to db`);

    if (englishVersion.split(" ").length > 1) {
      return new MoreThanOneWordErrorStatusClass(
        "Can not save a phrase or a sentence"
      );
    }

    const isSpelledCorrectly = dictionary.check(englishVersion);
    if (!isSpelledCorrectly) {
      return dictionary.suggest(englishVersion);
    }

    try {
      const translatedVersion = await translate(englishVersion, { to: "uk" });
      const addNewWordString = createWordQuery(
        englishVersion,
        translatedVersion
      );
      await DBHandler.executeQuery(addNewWordString);

      return new SuccessStatusClass("Word has been added successfully");
    } catch (error: any) {
      throw new DBErrorStatusClass(error.message);
    }
  }

  public async setWordUsed(id: number): Promise<StatusInterface> {
    logger.info(`Set word with id: ${id} used per current day`);

    try {
      const setWordUsedString = setWordUsedQuery(id);
      await DBHandler.executeQuery(setWordUsedString);

      return new SuccessStatusClass(
        `Field is_used_per_day successfully set true in word with id: ${id}`
      );
    } catch (error: any) {
      throw new DBErrorStatusClass(error.message);
    }
  }

  public async setAllWordsUnused(): Promise<StatusInterface> {
    logger.info(`Set all words unused`);

    try {
      const setAllWordsUnusedString = setAllWordsUnusedQuery();
      await DBHandler.executeQuery(setAllWordsUnusedString);

      return new SuccessStatusClass(
        `Field is_used_per_day successfully set false in all words`
      );
    } catch (error: any) {
      throw new DBErrorStatusClass(error.message);
    }
  }

  public async deleteWord(englishVersion: string): Promise<StatusInterface> {
    logger.info(`Deleting the word "${englishVersion}" from db`);

    try {
      const deleteWordString = deleteWordByEnglishVersionQuery(englishVersion);
      const deleteWordResponse = await DBHandler.executeQuery(deleteWordString);

      if (deleteWordResponse.rowCount) {
        return new SuccessStatusClass(
          `The word "${englishVersion}" deleted successfully`
        );
      } else {
        return new NotFoundErrorStatusClass(
          `The word "${englishVersion}" is not found`
        );
      }
    } catch (error: any) {
      throw new DBErrorStatusClass(error.message);
    }
  }
}
