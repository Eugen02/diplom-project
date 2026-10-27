import express from "express";
import { tryCatchWrapper } from "../../utils/tryCatchWrapper";
import { PlaylistController } from "../../controllers/playlist.controller";
import { checkAuth } from "../../middlewares/check-authorization";

const playlistController = new PlaylistController();
const router = express.Router();

router.get(
  "/all",
  checkAuth,
  tryCatchWrapper(playlistController.getAllPlaylists)
);
router.get("/:id", tryCatchWrapper(playlistController.getPlaylistById));
router.get(
  "/:id/recommendation/summary",
  tryCatchWrapper(playlistController.getRecommendationSummary)
);

router.post("/", checkAuth, tryCatchWrapper(playlistController.createPlaylist));
router.post(
  "/recommendation",
  checkAuth,
  tryCatchWrapper(playlistController.createRecommendedPlaylist)
);

router.put(
  "/:id/add-track",
  checkAuth,
  tryCatchWrapper(playlistController.addTrackToPlaylist)
);
router.put(
  "/:id/remove-track",
  checkAuth,
  tryCatchWrapper(playlistController.removeTrackFromPlaylist)
);

router.delete(
  "/:id",
  checkAuth,
  tryCatchWrapper(playlistController.deletePlaylist)
);

export default router;
