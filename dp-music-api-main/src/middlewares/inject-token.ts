import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { config } from "../config/env.config";

const privateKey = config.ACCESS_TOKEN_SECRET as string;

export const injectToken = (
  request: any,
  res: Response,
  next: NextFunction
): void => {
  const token = request.get("Authorization")?.split(" ")?.[1];

  if (!token) {
    next();

    return;
  }

  try {
    const payload = jwt.verify(token, privateKey);
    request.jwt = null;

    if (typeof payload !== "string" && payload) {
      request.jwt = payload;
    }

    next();
  } catch (error) {
    next();

    return;
  }
};
