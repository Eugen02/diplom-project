import { isBefore, subMinutes } from "date-fns";

export const isDateInPastFor = (dateString: string, minutes = 55) => {
  const date = new Date(dateString);
  const now = new Date();

  const minutesAgo = subMinutes(now, minutes);

  return isBefore(date, minutesAgo);
};
