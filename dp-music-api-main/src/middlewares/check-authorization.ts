import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { config } from "../config/env.config";
import { BadRequestError } from "../errors/bad-request-error";

const privateKey = config.ACCESS_TOKEN_SECRET as string;

export const checkAuth = (
  request: any,
  res: Response,
  next: NextFunction
): void => {
  const token = request.get("Authorization")?.split(" ")?.[1];

  console.log("token", token);
  console.log("privateKey", privateKey);

  if (!token) {
    next(new BadRequestError("Access denied, token missing"));

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
    console.log("Token error", error);
    next(new BadRequestError("Token issue"));

    return;
  }
};
