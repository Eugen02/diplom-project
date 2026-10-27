import { app } from "./express-app";
import http from "http";

export const httpServer = http.createServer(app);
