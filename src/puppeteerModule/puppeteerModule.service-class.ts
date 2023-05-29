import * as dotenv from "dotenv";
import * as puppeteer from "puppeteer";

dotenv.config();

export class PuppeteerModuleServiceClass {
  public async getRandomSentenceWithExactWord(word: string): Promise<string> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(
      `${<string>process.env.RANDOM_SENTENCE_PAGE_URL}sentence-with-${word}`
    );

    const sentenceList = await page.$$eval(
      "tbody > tr > td> span",
      (elements) => elements.map((item) => item.textContent)
    );

    let randomSentence = sentenceList
      .sort(() => 0.5 - Math.random())
      .slice(0, 1);

    await browser.close();

    return <string>randomSentence[0];
  }
}
