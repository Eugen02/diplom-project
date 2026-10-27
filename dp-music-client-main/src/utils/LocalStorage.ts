import { RefreshTokenResponseInterface } from "../types/interfaces/RefreshToken.interface";

interface LocalStorageInterface {
  setToken(token: string): void;
  setRefreshToken(refreshToken: string): void;
  setTokenExpiresIn(refreshToken: string): void;
  setRefreshTokenExpiresIn(refreshTokenExpiresIn: string): void;
  setAllAuthUserInfo(userAuthInfo: RefreshTokenResponseInterface): void;

  getToken(): string;
  getRefreshToken(): string;
  getTokenExpiresIn(): string;
  getRefreshTokenExpiresIn(): string;
}

export enum LocalStorageFields {
  TOKEN = "token",
  REFRESH_TOKEN = "refreshToken",
  TOKEN_EXPIRES_IN = "tokenExpirationTime",
  REFRESH_TOKEN_EXPIRES_IN = "refreshTokenExpirationTime",
}

class LocalStorageUtils implements LocalStorageInterface {
  setToken(token: string): void {
    localStorage.setItem(LocalStorageFields.TOKEN, token);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(LocalStorageFields.REFRESH_TOKEN, refreshToken);
  }

  setTokenExpiresIn(tokenExpirationTime: string): void {
    localStorage.setItem(
      LocalStorageFields.TOKEN_EXPIRES_IN,
      tokenExpirationTime
    );
  }

  setRefreshTokenExpiresIn(refreshTokenExpiresIn: string): void {
    localStorage.setItem(
      LocalStorageFields.REFRESH_TOKEN_EXPIRES_IN,
      refreshTokenExpiresIn
    );
  }

  getToken(): string {
    return localStorage.getItem(LocalStorageFields.TOKEN) || "";
  }

  getRefreshToken(): string {
    return localStorage.getItem(LocalStorageFields.REFRESH_TOKEN) || "";
  }

  getTokenExpiresIn(): string {
    return localStorage.getItem(LocalStorageFields.TOKEN_EXPIRES_IN) || "";
  }

  getRefreshTokenExpiresIn(): string {
    return (
      localStorage.getItem(LocalStorageFields.REFRESH_TOKEN_EXPIRES_IN) || ""
    );
  }

  setAllAuthUserInfo(
    userAuthInfo: Partial<RefreshTokenResponseInterface>
  ): void {
    const {
      token = "",
      refreshToken = "",
      expiresIn,
      refreshTokenExpiresIn,
    } = userAuthInfo || {};

    this.setToken(token);
    this.setRefreshToken(refreshToken);
    this.setTokenExpiresIn(String(expiresIn));
    this.setRefreshTokenExpiresIn(String(refreshTokenExpiresIn));
  }

  clearAuthData(): void {
    localStorage.removeItem(LocalStorageFields.TOKEN);
    localStorage.removeItem(LocalStorageFields.REFRESH_TOKEN);
    localStorage.removeItem(LocalStorageFields.TOKEN_EXPIRES_IN);
    localStorage.removeItem(LocalStorageFields.REFRESH_TOKEN_EXPIRES_IN);
  }
}

export const localStorageUtils = new LocalStorageUtils();
