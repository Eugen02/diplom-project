import { Response, Request, NextFunction } from "express";
import { BadRequestError } from "../errors/bad-request-error";

export const tryCatchWrapper = (callback: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await callback(req, res, next);
    } catch (error) {
      return next(new BadRequestError("Unknown error"));
    }
  };
};
