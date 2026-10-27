export const daysToMilliseconds = (days = 1): number => {
  const millisecondsInADay = 24 * 60 * 60 * 1000;
  const milliseconds = days * millisecondsInADay;

  return milliseconds;
};
