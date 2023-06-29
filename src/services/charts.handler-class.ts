import { StatsInterface } from "../types/stats.interface";
import ChartJsImage from "chartjs-to-image";

export class ChartsHandlerClass {
  private generateChart(
    pointsArray: number[],
    datesArray: string[],
    label: string
  ): string {
    const chartConfig = {
      type: "line",
      data: {
        labels: datesArray,
        datasets: [
          {
            label: label,
            data: pointsArray,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      },
    };

    const chart = new ChartJsImage();
    chart.setConfig(chartConfig);
    return chart.getUrl();
  }

  public generateScoreChart(statsArray: StatsInterface[]): string {
    const pointsArray = statsArray.map((stats) => stats.points);
    const datesArray = statsArray.map(
      (stats) => stats.created_at.toISOString().split("T")[0]
    );

    return this.generateChart(
      pointsArray,
      datesArray,
      "Графік отриманих балів за кожен день"
    );
  }

  public generateCorrectAnswersRatioChart(
    statsArray: StatsInterface[]
  ): string {
    const pointsArray = statsArray.map(
      (stats) =>
        (stats.correct_answers + stats.incorrect_answers) /
        stats.correct_answers
    );
    const datesArray = statsArray.map(
      (stats) => stats.created_at.toISOString().split("T")[0]
    );

    return this.generateChart(
      pointsArray,
      datesArray,
      "Графік співвідеошення правильних відповідей від усіх відповідей за кожен день"
    );
  }
}
