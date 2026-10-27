import "dotenv/config";

const {
  MONGO_URL,
  PORT,
  NGROCK_URL,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET,
  NODE_ENV,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
} = process.env as {
  [key: string]: string;
};

export const config = {
  NODE_ENV,
  MONGO_URL,
  PORT,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  NGROCK_URL,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
};
