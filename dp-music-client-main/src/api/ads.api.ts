import { httpClient } from "./HttpClient";

export class AdsApi {
  private ADS_ENDPOINT = "ads";

  logClick = async (campaignId: string, genre: string): Promise<any> => {
    return httpClient.post(`${this.ADS_ENDPOINT}/click`, {
      campaignId,
      genre,
    });
  };
}

export const adsApi = new AdsApi();
