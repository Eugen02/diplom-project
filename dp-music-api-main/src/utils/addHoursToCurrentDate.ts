import { addHours } from "date-fns";

export const addHoursToCurrentDate = (hours = 1): string => {
  const now = new Date();

  return addHours(now, hours).toString();
};
