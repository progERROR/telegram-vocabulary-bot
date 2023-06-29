export const getAllWordsQuery = () => `SELECT * FROM words;`;

export const getAllUnusedWordsQuery = () =>
  `SELECT * FROM words WHERE is_used_per_day = false;`;

export const getWordByEnglishVersionQuery = (english_version: string) =>
  `SELECT * FROM words WHERE english_version = '${english_version}';`;

export const createWordQuery = (
  english_version: string,
  translated_version: string
) =>
  `INSERT INTO words (english_version, translated_version)
     VALUES ('${english_version}', '${translated_version}');
    `;

export const setWordUsedQuery = (id: number) => `
  UPDATE words SET is_used_per_day = true
  WHERE id = ${id};
    `;

export const setAllWordsUnusedQuery = () =>
  `UPDATE words SET is_used_per_day = false;`;

export const deleteWordByEnglishVersionQuery = (english_version: string) =>
  `DELETE FROM words WHERE english_version = '${english_version}';`;
