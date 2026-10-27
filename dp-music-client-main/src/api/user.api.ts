import { httpClient } from "./HttpClient";
import {
  RecommenderEvaluationInterface,
  StatsResponseInterface,
} from "../types/interfaces/Stats.interface";

export class UserApi {
  private USER_ENDPOINT = "user";

  public getUser = async (): Promise<any> => {
    const { user } = await httpClient.get(`${this.USER_ENDPOINT}/`);

    return user;
  };

  public updateFavoriteGenres = async (genres: string[]): Promise<any> => {
    const { user } = await httpClient.patch(`${this.USER_ENDPOINT}/genres`, {
      genres,
    });

    return user;
  };

  public getRecentlyPlayed = async (limit = 10): Promise<any> => {
    const { data } = await httpClient.get(
      `${this.USER_ENDPOINT}/recently-played?limit=${limit}`
    );

    return data || [];
  };

  public getStats = async (): Promise<StatsResponseInterface> => {
    const { data } = await httpClient.get(`${this.USER_ENDPOINT}/stats`);

    return data;
  };

  public getRecommenderEvaluation =
    async (): Promise<RecommenderEvaluationInterface> => {
      const { data } = await httpClient.get(
        `${this.USER_ENDPOINT}/stats/recommender`
      );

      return data;
    };

  public updateProfile = async (updates: {
    name: string;
    surname?: string;
    avatarUrl?: string;
  }): Promise<any> => {
    const { user } = await httpClient.patch(
      `${this.USER_ENDPOINT}/profile`,
      updates
    );

    return user;
  };
}

export const userApi = new UserApi();
