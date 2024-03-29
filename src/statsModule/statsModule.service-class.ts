import DBHandler from "../db/pg";
import {
  createStatsQuery,
  getAllStatsQuery,
  getLatestStatsDataQuery,
  updateStatsQuery,
} from "./statsModule.db-queries";
import { DBErrorStatusClass } from "../types/statuses/errors.classes";
import { StatusInterface } from "../types/statuses/status.interface";
import { SuccessStatusClass } from "../types/statuses/successStatus.class";
import { ChartsHandlerClass } from "../services/charts.handler-class";
import { Logger } from "../logger/logger";

const logger = new Logger();
const chartsHandlerClass = new ChartsHandlerClass();
DBHandler.connect().then(() =>
  logger.info("[Stats Service]: stats service connected to db Pool;")
);

export class StatsModuleServiceClass {
  public async createStats(): Promise<StatusInterface> {
    logger.info(`Creating new stats`);

    try {
      const createStatsString = createStatsQuery();
      await DBHandler.executeQuery(createStatsString);

      return new SuccessStatusClass("Stats has been created successfully");
    } catch (error: any) {
      throw new DBErrorStatusClass(error.message);
    }
  }

  public async updateStats(
    points: number,
    correctAnswers: number,
    incorrectAnswers: number
  ): Promise<StatusInterface> {
    logger.info(`Updating latest stats`);

    try {
      const getLatestStatsDataString = getLatestStatsDataQuery();
      const getLatestStatsDataResponse = await DBHandler.executeQuery(
        getLatestStatsDataString
      );

      const updateStatsString = updateStatsQuery(
        getLatestStatsDataResponse.rows[0].points + points,
        getLatestStatsDataResponse.rows[0].correct_answers + correctAnswers,
        getLatestStatsDataResponse.rows[0].incorrect_answers + incorrectAnswers
      );
      await DBHandler.executeQuery(updateStatsString);

      return new SuccessStatusClass("Stats has been updated successfully");
    } catch (error: any) {
      throw new DBErrorStatusClass(error.message);
    }
  }

  public async generateChartStatistics(): Promise<{ [key: string]: string }> {
    const getAllStatsString = getAllStatsQuery();
    const getAllStatsResponse = await DBHandler.executeQuery(getAllStatsString);

    const scoreChartUrl = chartsHandlerClass.generateScoreChart(
      getAllStatsResponse.rows
    );
    const correctAnswersRatioChartUrl =
      chartsHandlerClass.generateCorrectAnswersRatioChart(
        getAllStatsResponse.rows
      );

    return { scoreChartUrl, correctAnswersRatioChartUrl };
  }
}
