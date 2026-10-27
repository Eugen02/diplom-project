import { logger } from "./winston";

export const logGeneral = async (message: string) => {
  logger.info(`[GENERAL]: ${message}`);
};
