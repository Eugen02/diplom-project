import mongoose from "mongoose";
import { config } from "../config/env.config";

mongoose.connection.once("open", () => {
  console.log("MONGO DB CONNECTED");
});

mongoose.connection.on("error", (error) => {
  console.log("MONGO DB ERROR");
  console.error(error);
});

export async function mongoConnect() {
  await mongoose.connect(config.MONGO_URL, {
    // @ts-ignore
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

export async function mongoDisconnect() {
  await mongoose.disconnect();
}
