import { Request, Response } from "express";
import axios from "axios";
import { getSpotifyToken } from "../utils/startServer";

export class HealthController {
  async getHealth(request: Request, response: Response): Promise<void> {
    try {
      const result = await axios.get(
        "https://api.spotify.com/v1/tracks/3WpHqtFUwzIQBsV9YC5iNc",
        {
          headers: {
            Authorization: `Bearer ${getSpotifyToken()}`,
          },
        }
      );

      // Extracting only the data part from the response
      const { album, artists, name } = result.data;

      const { images } = album;
      const trackCover = images[0].url || images[1].url || images[2].url || "";

      response.status(200).json({ trackCover, artists, name });
    } catch (error) {
      console.error("error");
      console.error(error);
      response.status(200).json({ error: "Spotify error" });
    }
  }
}
