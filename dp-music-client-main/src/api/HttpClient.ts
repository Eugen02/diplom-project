import { BASE_URL } from "../config/endpoints";
import { store } from "../hooks/useStore";
import { localStorageUtils } from "../utils/LocalStorage";

interface HttpClientInterface {
  get(path: string): Promise<any>;
  post(path: string, params?: Object): Promise<any>;
  put(path: string, params?: Object): Promise<any>;
  patch(path: string, params?: Object): Promise<any>;
  delete(path: string, params?: Object): Promise<any>;
}

const TOKEN_ERROR_MESSAGES = ["Token issue", "Access denied, token missing"];

export class HttpClient implements HttpClientInterface {
  private refreshPromise: Promise<boolean> | null = null;

  async get(path: string): Promise<any> {
    return this.request(path, {
      headers: new Headers({ ...this.getAuthHeaders() }),
    });
  }

  async post(path: string, params?: any): Promise<any> {
    return this.request(path, {
      method: "POST",
      headers: new Headers({ ...this.getAuthHeaders() }),
      body: JSON.stringify({ ...params }),
    });
  }

  async put(path: string, params?: any): Promise<any> {
    return this.request(path, {
      method: "PUT",
      headers: new Headers({ ...this.getAuthHeaders() }),
      body: JSON.stringify({ ...params }),
    });
  }

  async patch(path: string, params?: Object): Promise<any> {
    return this.request(path, {
      method: "PATCH",
      headers: new Headers({ ...this.getAuthHeaders() }),
      body: JSON.stringify(params),
    });
  }

  async delete(path: string, params?: Object): Promise<any> {
    return this.request(path, {
      method: "DELETE",
      headers: new Headers({ ...this.getAuthHeaders() }),
    });
  }

  // Transparently refreshes an expired access token and retries once, so an
  // access token expiring mid-session doesn't surface as a logout.
  private async request(
    path: string,
    init: RequestInit,
    isRetry = false
  ): Promise<any> {
    const response = await fetch(`${BASE_URL}/${path}`, init);
    const parsedResponse = await response.json();

    const isTokenError = parsedResponse?.errors?.some((error: any) =>
      TOKEN_ERROR_MESSAGES.includes(error?.message)
    );

    if (isTokenError && !isRetry) {
      const didRefresh = await this.refreshAccessToken();

      if (didRefresh) {
        return this.request(
          path,
          { ...init, headers: new Headers({ ...this.getAuthHeaders() }) },
          true
        );
      }
    }

    return parsedResponse;
  }

  private refreshAccessToken(): Promise<boolean> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.doRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  private async doRefresh(): Promise<boolean> {
    const refreshToken = localStorageUtils.getRefreshToken();

    if (!refreshToken) {
      store.userStore.logout();

      return false;
    }

    try {
      const response = await fetch(`${BASE_URL}/user/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const parsedResponse = await response.json();

      if (!parsedResponse?.token) {
        store.userStore.logout();

        return false;
      }

      localStorageUtils.setAllAuthUserInfo(parsedResponse);

      return true;
    } catch (error) {
      store.userStore.logout();

      return false;
    }
  }

  private getAuthHeaders(): any {
    const headers: any = {
      Authorization: `Bearer ${localStorageUtils.getToken()}`,
      "Content-Type": "application/json",
    };

    return headers;
  }
}

const httpClient = new HttpClient();

export { httpClient };
