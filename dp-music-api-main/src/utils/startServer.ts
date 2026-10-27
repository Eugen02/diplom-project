import axios from "axios";
import { config } from "../config/env.config";
import { mongoConnect } from "../database/mongo";
import { LogDBTypesEnum, logDB } from "../logs/logDB";
import { LogErrorTypesEnum, logError } from "../logs/logError";
import { logGeneral } from "../logs/logGeneral";

let spotifyToken = "";

export const startServer = async (): Promise<void> => {
  try {
    await mongoConnect();

    const spotifyTokenRequestUrl = `https://accounts.spotify.com/api/token`;
    const response = await axios(spotifyTokenRequestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        grant_type: "client_credentials",
        client_id: config.SPOTIFY_CLIENT_ID,
        client_secret: config.SPOTIFY_CLIENT_SECRET,
      },
    });
    spotifyToken = response.data.access_token;
    console.log("spotifyToken", spotifyToken);

    logDB({ message: "MongoDB connected", type: LogDBTypesEnum.CONNECTION });
  } catch (error) {
    logError({
      message: "Unable to connect to MongoDB",
      type: LogErrorTypesEnum.DB,
    });

    throw new Error("Unable to connect to MongoDB");
  }

  logGeneral(`Server running on port ${config.PORT}`);
};

export const getSpotifyToken = (): string => {
  return spotifyToken;
};
