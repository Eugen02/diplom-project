import express from "express";
import { HealthController } from "../../controllers/health.controller";
import { tryCatchWrapper } from "../../utils/tryCatchWrapper";

const healthController = new HealthController();
const router = express.Router();

router.get("/", tryCatchWrapper(healthController.getHealth));

export default router;
