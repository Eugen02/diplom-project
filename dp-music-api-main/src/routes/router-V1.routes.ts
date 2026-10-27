import express from "express";

import healthRouter from "./api-version-1/health.routes";
import tracksRouter from "./api-version-1/tracks.routes";
import playlistRouter from "./api-version-1/playlist.routes";
import userRouter from "./api-version-1/user.routes";
import adsRouter from "./api-version-1/ads.routes";

const router = express.Router();

router.use((req, res, next) => {
  console.log("routerV1");

  next();
});

router.use("/health", healthRouter);

router.use("/track", tracksRouter);
router.use("/playlist", playlistRouter);

router.use("/user", userRouter);
router.use("/ads", adsRouter);

export { router as routerV1 };
