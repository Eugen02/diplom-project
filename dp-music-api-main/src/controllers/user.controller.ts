import jwt from "jsonwebtoken";
import { daysToMilliseconds } from "./../utils/daysToMilliseconds";
import { minutesToMilliseconds } from "./../utils/minutesToMilliseconds";
import { UserErrorMessagesEnum } from "./../constants/error-messages/user-error-messages";
import { NextFunction, Request, Response } from "express";
import { userRecord } from "../database/active-records/user.record";
import { BadRequestError } from "../errors/bad-request-error";
import { UserInterface } from "../types/interface/User.interface";
import { config } from "../config/env.config";
import { JWTInterface } from "../types/interface/JWT.interface";
import { playHistoryRecord } from "../database/active-records/playHistory.record";
import { statsRecord } from "../database/active-records/stats.record";
import { recommendationService } from "../services/Reccomendation.service";

// The leave-one-out evaluation runs hundreds of index queries; playlists
// change rarely, so reuse the result for a while.
const EVALUATION_CACHE_TTL_MS = 10 * 60 * 1000;
let evaluationCache: { computedAt: number; result: any } | null = null;

export class UserController {
  constructor() {
    this.createUser = this.createUser.bind(this);
    this.getUser = this.getUser.bind(this);
    this.getJwtData = this.getJwtData.bind(this);
    this.signIn = this.signIn.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.updateFavoriteGenres = this.updateFavoriteGenres.bind(this);
    this.getRecentlyPlayed = this.getRecentlyPlayed.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.getStats = this.getStats.bind(this);
    this.getRecommenderEvaluation = this.getRecommenderEvaluation.bind(this);
  }

  async getStats(request: Request, response: Response): Promise<void> {
    // @ts-ignore
    const { id: userId } = request?.jwt?.user || {};

    const [user, platformAds, abTest] = await Promise.all([
      statsRecord.getUserStats(userId),
      statsRecord.getPlatformAdStats(),
      statsRecord.getAdExperiment(userId),
    ]);

    response.status(200).json({ data: { user, platformAds, abTest } });
  }

  async getRecommenderEvaluation(
    request: Request,
    response: Response
  ): Promise<void> {
    const isFresh =
      evaluationCache &&
      Date.now() - evaluationCache.computedAt < EVALUATION_CACHE_TTL_MS;

    if (!isFresh) {
      const playlists = await statsRecord.getAllPlaylistTrackIds();
      const result = await recommendationService.evaluate(playlists);

      evaluationCache = { computedAt: Date.now(), result };
    }

    response.status(200).json({
      data: { ...evaluationCache!.result, computedAt: evaluationCache!.computedAt },
    });
  }

  async getUser(request: Request, response: Response): Promise<void> {
    // @ts-ignore
    const { id } = request?.jwt?.user;

    console.log("--- id ---");
    console.log(id);

    if (!id) {
      response.status(400).json({ message: "id is required" });

      return;
    }

    const user = await userRecord.getUserById(id);

    response.status(200).json({ user });
  }

  async getRecentlyPlayed(request: Request, response: Response): Promise<void> {
    // @ts-ignore
    const { id: userId } = request?.jwt?.user || {};

    if (!userId) {
      response.status(200).json({ data: [] });

      return;
    }

    const limit = Number(request.query.limit) || 10;
    const tracks = await playHistoryRecord.getRecentlyPlayed(userId, limit);

    response.status(200).json({ data: tracks });
  }

  async updateFavoriteGenres(
    request: Request,
    response: Response
  ): Promise<void> {
    // @ts-ignore
    const { id } = request?.jwt?.user;
    const { genres } = request.body as { genres: string[] };

    const updatedUser = await userRecord.updateFavoriteGenres(
      id,
      genres || []
    );

    response.status(200).json({ user: updatedUser });
  }

  async updateProfile(request: Request, response: Response, next: NextFunction): Promise<void> {
    // @ts-ignore
    const { id } = request?.jwt?.user;
    const { name, surname, avatarUrl } = request.body as {
      name?: string;
      surname?: string;
      avatarUrl?: string;
    };

    if (!name || !name.trim()) {
      return next(new BadRequestError("Name is required"));
    }

    const updates: { name: string; surname?: string; avatarUrl?: string } = {
      name: name.trim(),
    };

    if (surname !== undefined) {
      updates.surname = surname.trim();
    }

    if (avatarUrl !== undefined) {
      updates.avatarUrl = avatarUrl;
    }

    const updatedUser = await userRecord.updateProfile(id, updates);

    response.status(200).json({ user: updatedUser });
  }

  async createUser(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    const { name, login, age, password } = request.body as UserInterface;

    const userByLogin = await userRecord.getUserByLogin(login);
    const isUserExist = Boolean(userByLogin?.id);

    if (isUserExist) {
      return next(
        new BadRequestError(UserErrorMessagesEnum.USER_ALREADY_EXISTS)
      );
    }

    const createdUser = await userRecord.createUser({
      name,
      login,
      age,
      password,
    });

    const jwtData = this.getJwtData(
      login,
      // @ts-ignore
      createdUser.id
    );

    response.status(201).json({ ...jwtData, user: createdUser });
  }

  async signIn(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    const { login, password } = request.body;

    const userByLogin = await userRecord.getUserByLogin(login);
    const isUserExist = Boolean(userByLogin?.id);

    if (!isUserExist) {
      return next(new BadRequestError(UserErrorMessagesEnum.USER_NOT_FOUND));
    }

    if (userByLogin.password !== password) {
      return next(new BadRequestError(UserErrorMessagesEnum.USER_NOT_FOUND));
    }

    const jwtData = this.getJwtData(userByLogin.login, userByLogin.id);

    response.status(200).json({
      ...jwtData,
      user: userByLogin,
    });
  }

  async refreshToken(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    const { refreshToken } = request.body;

    if (!refreshToken) {
      return next(
        new BadRequestError(UserErrorMessagesEnum.INVALID_REFRESH_TOKEN)
      );
    }

    try {
      const refreshTokenSecret = config.REFRESH_TOKEN_SECRET as string;
      const { user } = jwt.verify(refreshToken, refreshTokenSecret) as {
        user: { id: string; login: string };
      };

      const jwtData = this.getJwtData(user.login, user.id);

      response.status(200).json(jwtData);
    } catch (error) {
      next(new BadRequestError(UserErrorMessagesEnum.INVALID_REFRESH_TOKEN));
    }
  }

  private getJwtData(login: string, id: string): JWTInterface {
    const accessTokenSecret = config.ACCESS_TOKEN_SECRET as string;
    const refreshTokenSecret = config.REFRESH_TOKEN_SECRET as string;
    const publicTokenData = {
      user: { id, login },
    };

    const accessTokenTtlMs = minutesToMilliseconds(40);
    const refreshTokenTtlMs = daysToMilliseconds(360);

    // jsonwebtoken's numeric expiresIn is in seconds, *ToMilliseconds isn't
    const accessToken = jwt.sign(publicTokenData, accessTokenSecret, {
      expiresIn: accessTokenTtlMs / 1000,
    });

    const refreshToken = jwt.sign(publicTokenData, refreshTokenSecret, {
      expiresIn: refreshTokenTtlMs / 1000,
    });

    return {
      token: accessToken,
      refreshToken: refreshToken,
      expiresIn: Date.now() + accessTokenTtlMs,
      refreshTokenExpiresIn: Date.now() + refreshTokenTtlMs,
    };
  }
}
