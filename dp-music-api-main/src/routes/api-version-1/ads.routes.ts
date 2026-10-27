import express from "express";
import { tryCatchWrapper } from "../../utils/tryCatchWrapper";
import { AdsController } from "../../controllers/ads.controller";
import { checkAuth } from "../../middlewares/check-authorization";

const adsController = new AdsController();
const router = express.Router();

router.get("/stats", checkAuth, tryCatchWrapper(adsController.getStats));
router.post("/click", checkAuth, tryCatchWrapper(adsController.logClick));

export default router;
