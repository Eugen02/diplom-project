import { checkAuth } from "./../../middlewares/check-authorization";
import express from "express";
import { tryCatchWrapper } from "../../utils/tryCatchWrapper";
import { UserController } from "../../controllers/user.controller";

const userController = new UserController();
const router = express.Router();

router.get("/", checkAuth, tryCatchWrapper(userController.getUser));

router.post("/signup", tryCatchWrapper(userController.createUser));

router.post("/signin", tryCatchWrapper(userController.signIn));

router.post("/refresh-token", tryCatchWrapper(userController.refreshToken));

router.patch(
  "/genres",
  checkAuth,
  tryCatchWrapper(userController.updateFavoriteGenres)
);

router.get(
  "/recently-played",
  checkAuth,
  tryCatchWrapper(userController.getRecentlyPlayed)
);

router.get("/stats", checkAuth, tryCatchWrapper(userController.getStats));

router.get(
  "/stats/recommender",
  checkAuth,
  tryCatchWrapper(userController.getRecommenderEvaluation)
);

router.patch(
  "/profile",
  checkAuth,
  tryCatchWrapper(userController.updateProfile)
);

export default router;
