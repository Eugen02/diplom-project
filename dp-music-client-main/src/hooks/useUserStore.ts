import { UserStore } from "../stores/UserStore";
import { StoresEnum, useStore } from "./useStore";

export const useUserStore = () => {
  let { user, setCurrentUser, logout } = useStore(
    StoresEnum.USER_STORE
  ) as UserStore;

  return {
    user,
    setCurrentUser,
    logout,
  };
};
