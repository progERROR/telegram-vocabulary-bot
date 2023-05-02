export const getAllStatsQuery = () =>
  `SELECT * FROM stats 
    ORDER BY created_at DESC;
    `;

export const getLatestStatsDataQuery = () =>
  `SELECT points, correct_answers, incorrect_answers
    FROM stats 
    WHERE created_at = ( SELECT MAX(created_at) FROM stats );
    `;

export const createStatsQuery = () =>
  `INSERT INTO stats ()
    VALUES ();
    `;

export const updateStatsQuery = (
  points: number,
  correct_answers: number,
  incorrect_answers: number
) => {
  let updateStatsString = `UPDATE payment_methods SET `;

  const builtQueryArray = [];
  const dtoArray = Object.entries({
    points,
    correct_answers,
    incorrect_answers,
  });

  for (const value of dtoArray) {
    if (value[1] !== undefined) {
      builtQueryArray.push(`${value[0]} = '${value[1]}'`);
    }
  }

  updateStatsString +=
    builtQueryArray.join(", ") +
    ` WHERE created_at = ( SELECT MAX(created_at) FROM stats );`;
  return updateStatsString;
};
