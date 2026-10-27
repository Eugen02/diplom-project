import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom-error";
import { LogErrorTypesEnum, logError } from "../logs/logError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    logError({
      message: err.message,
      statusCode: err.statusCode,
      routePath: req.path,
      method: req.method,
      type: LogErrorTypesEnum.CONTROLLER,
    });

    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  res.status(400).send({
    errors: [{ message: "Something went wrong" }],
  });
};
