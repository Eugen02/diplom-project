export const minutesToMilliseconds = (minutes = 1): number => {
  const millisecondsInAMinute = 60 * 1000;
  const milliseconds = minutes * millisecondsInAMinute;

  return milliseconds;
};
