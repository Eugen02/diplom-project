import express from "express";
import { tryCatchWrapper } from "../../utils/tryCatchWrapper";
import { TracksController } from "../../controllers/tracks.controller";
import { checkAuth } from "../../middlewares/check-authorization";

const tracksController = new TracksController();
const router = express.Router();

router.get("/root", tryCatchWrapper(tracksController.getRootTracks));
router.get("/genres", tryCatchWrapper(tracksController.getGenres));
router.get("/:id/preview", tryCatchWrapper(tracksController.getPreview));
router.get("/:id", tryCatchWrapper(tracksController.getTrackById));

router.post("/", tryCatchWrapper(tracksController.createTrack));

router.put("/:id/like", checkAuth, tryCatchWrapper(tracksController.likeTrack));
router.put(
  "/:id/unlike",
  checkAuth,
  tryCatchWrapper(tracksController.unlikeTrack)
);

router.post("/:id/play", checkAuth, tryCatchWrapper(tracksController.logPlay));

export default router;
