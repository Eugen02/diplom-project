import { format } from "date-fns";
import { uk, pl, enUS } from "date-fns/locale";
import { LanguagesEnum } from "../types/enums/LanguagesEnum";

const localesMap: any = {
  [LanguagesEnum.UK]: uk,
  [LanguagesEnum.PL]: pl,
  [LanguagesEnum.EN]: enUS,
};

export const getStandardLocaleDate = (
  date: string | Date,
  language: LanguagesEnum,
  monthFormat = "LLLL"
): string => {
  let dateToFormat = "";

  try {
    dateToFormat = format(new Date(date), `dd ${monthFormat} yy`, {
      locale: localesMap[language],
    });

    return dateToFormat;
  } catch (error: any) {
    return dateToFormat;
  }
};
