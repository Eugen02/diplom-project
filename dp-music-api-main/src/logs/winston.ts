import winston from "winston";

import { config } from "../config/env.config";
import { EnvsEnum } from "../types/enum/EnvsEnum";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.colorize(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (config.NODE_ENV !== EnvsEnum.PRODUCTION) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
