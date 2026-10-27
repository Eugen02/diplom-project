import { UserInterface } from "./User.interface";

export interface RefreshTokenResponseInterface {
  user: UserInterface;
  token: string;
  refreshToken: string;
  expiresIn: number;
  refreshTokenExpiresIn: number;
}
