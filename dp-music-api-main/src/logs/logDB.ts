import { logger } from "./winston";

export enum LogDBTypesEnum {
  CONNECTION = "CONNECTION",
  RECORD = "RECORD",
}

interface LogDBInterface {
  message: string;
  type?: LogDBTypesEnum;
  record?: string;
}

export const logDB = async (dbLog: LogDBInterface) => {
  const { message, ...restDBLogInfo } = dbLog;

  logger.info(`[DATABASE]: ${message}`, restDBLogInfo);
};
