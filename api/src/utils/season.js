/** Malawi rainy season is roughly November to April. */
export function currentSeason(date = new Date()) {
  const month = date.getMonth() + 1;
  return month >= 11 || month <= 4 ? 'rainy' : 'dry';
}
