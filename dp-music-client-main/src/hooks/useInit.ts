import { useEffect, useState } from "react";
import { authApi } from "../api/auth.api";
import { userApi } from "../api/user.api";
import { checkIsTokenExpired } from "../utils/checkIsTokenExpired";
import { localStorageUtils } from "../utils/LocalStorage";
import { useUserStore } from "./useUserStore";

export const useInit = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { setCurrentUser } = useUserStore();

  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorageUtils.getToken();
      const accessTokenExpiresIn = localStorageUtils.getTokenExpiresIn();
      const refreshToken = localStorageUtils.getRefreshToken();
      const refreshTokenExpiresIn = localStorageUtils.getRefreshTokenExpiresIn();

      try {
        if (accessToken && !checkIsTokenExpired(accessTokenExpiresIn)) {
          const user = await userApi.getUser();

          setCurrentUser(user);

          return;
        }

        if (refreshToken && !checkIsTokenExpired(refreshTokenExpiresIn)) {
          const newTokens = await authApi.refreshToken(refreshToken);

          localStorageUtils.setAllAuthUserInfo(newTokens);

          const user = await userApi.getUser();

          setCurrentUser(user);

          return;
        }

        localStorageUtils.clearAuthData();
      } catch (error) {
        localStorageUtils.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  return {
    isLoading,
  };
};
