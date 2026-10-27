import { Request, Response, NextFunction } from "express";
import { logger } from "./winston";

type CallbackType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const logController = (callback: CallbackType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // logger.info(`[CONTROLLER START]: ${req.method} Request received`, {
    //   url: req.url,
    // });

    await callback(req, res, next);

    // logger.info(`[CONTROLLER END]: ${req.method} Request finished`, {
    //   url: req.url,
    // });

    next();
  };
};
