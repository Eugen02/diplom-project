import express from "express";
import cors from "cors";

import { errorHandler } from "./middlewares/error-handeler";
import { NotFoundError } from "./errors/not-found-error";
import { httpServer } from "./config/server";

import { app } from "./config/express-app";
import { routerV1 } from "./routes/router-V1.routes";
import { config } from "./config/env.config";
import { startServer } from "./utils/startServer";

export let spotifyToken = "";

app.use(cors());
app.use(express.json({ limit: "6mb" }));
app.use(express.urlencoded({ extended: true, limit: "6mb" }));

app.use("/api/v1", routerV1);

app.all("*", async (rq, rs, next) => {
  next(new NotFoundError());
});

app.use(errorHandler);

httpServer.listen(config.PORT, startServer);
