import { makeAutoObservable } from "mobx";
import { UserInterface } from "../types/interfaces/User.interface";
import { localStorageUtils } from "../utils/LocalStorage";

export class UserStore {
  public user: UserInterface | null = null;

  constructor() {
    makeAutoObservable(this);

    this.setCurrentUser = this.setCurrentUser.bind(this);
    this.logout = this.logout.bind(this);
  }

  setCurrentUser(user: UserInterface) {
    this.user = user;
  }

  logout() {
    this.user = null;

    localStorageUtils.clearAuthData();
  }
}
