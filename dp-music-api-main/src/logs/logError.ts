import { logger } from "./winston";

export enum LogErrorTypesEnum {
  DB = "DB",
  CONTROLLER = "CONTROLLER",
  MIDDLEWARE = "MIDDLEWARE",
  OTHER = "OTHER",
}

interface LogErrorInterface {
  message: string;
  routePath?: string;
  method?: string;
  statusCode?: number;
  type?: LogErrorTypesEnum;
}

export const logError = (error: LogErrorInterface) => {
  const { message, ...restErrorInfo } = error;

  logger.error(`[ERROR]: ${message}`, restErrorInfo);
};
