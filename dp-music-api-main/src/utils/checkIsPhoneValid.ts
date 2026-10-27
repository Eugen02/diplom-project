import { phone as validatePhone } from "phone";
import { trimPlusInPhone } from "./trimPlusInPhone";

const PHONE_REGEX = /^\+?[0-9]{10,14}$/;

export const checkIsPhoneValid = (phone: string): boolean => {
  if (!PHONE_REGEX.test(phone)) {
    return false;
  }

  const trimmedPhone = trimPlusInPhone(phone);

  const phoneInfo = validatePhone(`+${trimmedPhone}`);
  const { isValid, countryIso2 } = phoneInfo as any;
  const isCountryValid = ["PL", "UA"].includes(countryIso2);

  return isValid && isCountryValid;
};
