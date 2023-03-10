import dbHandler from "./pg/index";

export async function initLocalDb(): Promise<void> {
  const initLocalDbString = `
    CREATE TABLE IF NOT EXISTS words (
        id SERIAL PRIMARY KEY NOT NULL,
        english_version VARCHAR(50) NOT NULL,
        translated_version VARCHAR(50) NOT NULL,
        is_used_per_day BOOLEAN DEFAULT false NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS stats (
        id SERIAL PRIMARY KEY NOT NULL,
        points INTEGER DEFAULT 0 NOT NULL,
        correct_answers INTEGER DEFAULT 0 NOT NULL,
        incorrect_answers INTEGER DEFAULT 0 NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `;

  await dbHandler.executeQuery(initLocalDbString);
}
